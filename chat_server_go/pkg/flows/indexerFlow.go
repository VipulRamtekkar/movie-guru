package flows

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/movie-guru/pkg/db"
	pgv "github.com/pgvector/pgvector-go"

	types "github.com/movie-guru/pkg/types"
)

func GetIndexerFlow(maxRetLength int, movieDB *db.MovieDB, embedder ai.Embedder) *genkit.Flow[*types.MovieContext, *ai.Document, struct{}] {
	indexerFlow := genkit.DefineFlow("movieDocFlow",
		func(ctx context.Context, doc *types.MovieContext) (*ai.Document, error) {
			time.Sleep(1 / 3 * time.Second)                    // reduce rate at which operation is performed to avoid hitting VertexAI rate limits
			filteredContent := createText(doc)                 // creates a JSON string representation of the important fields in a MovieContext object.
			aiDoc := ai.DocumentFromText(filteredContent, nil) // create an object of type ai.Document which is fed into the embedder (to be implemented)

			// INSTRUCTIONS: Write code that generates an embedding
			// - Step 1: Create an embedding from the filteredContent.
			// - Step 2: Write a SQL statement to insert the embedding along with the other fields in the table.
			// - Take inspiration from the indexer implementation here: https://github.com/firebase/genkit/blob/main/go/samples/pgvector/main.go
			// HINTS:
			//- Look at the schema for the table to understand what fields are required.
			//- Make sure the required (internal and external) GO modules are imported.

			// FIX THIS: This is NOT a useful embedding. You DO NOT generate embeddings this way.
			embedding := []float32{}

			//FIX THIS: Partially implemented db query.
			query := `INSERT INTO movies (embedding,  tconst) 
			VALUES ($1, $2)
			ON CONFLICT (tconst) DO NOTHING;
			`
			dbCtx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
			defer cancel()

			_, err := movieDB.DB.ExecContext(dbCtx, query,
				pgv.NewVector(embedding), doc.Tconst)
			if err != nil {
				return nil, err
			}

			return aiDoc, nil
		})
	return indexerFlow
}

// createText creates a JSON string representation of the relevant fields in a MovieContext object.
// This string is used as the content for the AI document from which the vector embedding is created.
// This string is also uploaded into the context column of the table.
func createText(movie *types.MovieContext) string {
	dataDict := map[string]interface{}{
		// INSTRUCTIONS: Write code that populates dataDict with relevant fields from raw data.
		// 1. Which other fields from the raw data should the dict contain?
		// 1. Are there any fields in the orginal data that need to be reformatted?
		// Here are two freebies to help you get started.
		"title": movie.Title,
		"genres": func() string {
			if len(movie.Genres) > 0 {
				return strings.Join(movie.Genres, ", ") // Assuming you want to join genres with commas
			}
			return ""
		}(),
	}

	jsonData, _ := json.Marshal(dataDict)
	stringData := string(jsonData)
	return stringData
}

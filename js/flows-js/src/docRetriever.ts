import { embed } from '@genkit-ai/ai/embedder';
import { Document, defineRetriever, retrieve } from '@genkit-ai/ai/retriever';
import { defineFlow } from '@genkit-ai/flow';
import { textEmbedding004 } from '@genkit-ai/vertexai';
import { toSql } from 'pgvector';
import { z } from 'zod';
import { MovieContextSchema, MovieContext } from './movieFlowTypes';
import { openDB } from './db';

const RetrieverOptionsSchema = z.object({
  k: z.number().optional().default(10),
});

const QuerySchema = z.object({
  query: z.string(),
});

// Defining the Retriever
const sqlRetriever = defineRetriever(
  {
    name: 'movies',
    configSchema: RetrieverOptionsSchema,
  },

  async (query, options) => {
    const db = await openDB();
    if (!db) {
      throw new Error('Database connection failed');
    }

    // 1. Create an embedding for the query
    const query_embedding = await embed({
      embedder: textEmbedding004,
      content: query,
    });

    let res;
    try {
      res = await db`
      SELECT *,
      embedding <-> ${toSql(query_embedding)} as distance
      FROM movies
      ORDER BY distance
      LIMIT ${options.k};
      `; 
    } catch (error) {
      console.error('Error querying:', error);
      throw error; // Re-throw the error to be handled by the outer try...catch
    }

    const documents = res.map(row => ({
      content: [{ text: row.plot }], // Wrapping the plot in an array with an object containing a text property
      metadata: {
        title: row.title,
        runtimeMinutes: row.runtime_minutes,
        genres: row.genres.split(',').map((genre: string) => genre.trim()), // Specify the type
        rating: row.rating,
        released: row.released,
        director: row.director,
        actors: row.actors.split(',').map((actor: string) => actor.trim()), // Specify the type
        poster: row.poster,
        tconst: row.tconst,
        distance: row.distance,
      }
    }));

    // 4. Return the list of documents
    return {
      documents,
    };
  }
);
export const movieDocFlow = defineFlow(
  {
    name: 'movieDocFlow',
    inputSchema: QuerySchema,
    outputSchema: z.array(MovieContextSchema), // Array of MovieContextSchema
  },
  async (input) => {
    const docs = await retrieve({
      retriever: sqlRetriever,
      query: {
        content: [{ text: input.query }],
      },
      options: {
        k: 10,
      },
    });
    const movieContexts: MovieContext[] = [];

    for (const doc of docs) {
      if (doc.metadata) {
        const movieContext: MovieContext = {
          title: doc.metadata.title,
          runtime_minutes: doc.metadata.runtimeMinutes,
          genres: doc.metadata.genres,
          rating: doc.metadata.rating,
          plot: doc.metadata.plot,
          released: doc.metadata.released,
          director: doc.metadata.director,
          actors: doc.metadata.actors,
          poster: doc.metadata.poster,
          tconst: doc.metadata.tconst,
        };
        movieContexts.push(movieContext);
      } else {
        console.warn('Movie metadata is missing for a document.');
      }
    }

    return movieContexts;
  }
);
export const UserProfilePromptText = 
	` 
Here are the inputs:
	1. Optional Message 0 from agent: {{agentMessage}}
	2. Required Message 1 from user: {{query}}

    Based on the {{query}} decide the category. The category, item and sentiment can be for part
    of user input and the connecting word can be "and", "or", "but", etc.
    There are 4 category: Genre, Actor, Director and Other.
    Items can be genres, actor, director, etc.
    Once the category is decided keep the structure same and append 
    If user input includes multiple categories output the structure for each category.
    IGNORE WEAK/TEMPORARY SENTIMENTS including words like feel, etc output just justification in that case.
`
export const QueryTransformPromptText = 
`
Here are the inputs:
* userProfile: (May be empty)
    * likes: 
        * actors: {{#each userProfile.likes.actors}}{{this}}, {{~/each}}
        * directors: {{#each userProfile.likes.directors}}{{this}}, {{~/each}}
        * genres: {{#each userProfile.likes.genres}}{{this}}, {{~/each}}
        * others: {{#each userProfile.likes.others}}{{this}}, {{~/each}}
    * dislikes: 
        * actors: {{#each userProfile.dislikes.actors}}{{this}}, {{~/each}}
        * directors: {{#each userProfile.dislikes.directors}}{{this}}, {{~/each}}
        * genres: {{#each userProfile.dislikes.genres}}{{this}}, {{~/each}}
        * others: {{#each userProfile.dislikes.others}}{{this}}, {{~/each}}
* userMessage: {{userMessage}}
* history: (May be empty)
    {{#each history}}{{this.role}}: {{this.content}}{{~/each}}

Based on message identify userintent, justification and transform the query. In case of greeting, the intent is greet and 
transformquery is blank. 
Understand whether the intent is END_CONVERSATION, GREET, ACKNOWLEDGE, etc. Return null for transformquery in case of END_CONVERSATION.
When deciding the justification consider past likes and dislikes. Also consider them and modify the transformquery accordingly.
`
export const MovieFlowPromptText = 
` 
    Here are the inputs:
    * userPreferences: (May be empty)
    * userMessage: {{userMessage}}
    * history: (May be empty)
    * Context retrieved from vector db (May be empty):
    
    DO NOT HELP IN ANYTHING OTHER THEN MOVIES
    WAIT FOR USER INFORMATION TO UNDERSTAND THE INTENT BEFORE GIVING OUTPUT
    INTERACT WITH USER BASED ON THEIR CURRENT QUERY AND ADD IN CONTEXT ONLY IF RELEVANT OTHERWISE ONLY ANSWER AS PER THE QUERY.

    `

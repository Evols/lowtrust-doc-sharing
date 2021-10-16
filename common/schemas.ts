
import { z } from 'zod';

// A challenge is used to ensure the client can access (read or write) a given document 
// The challenge consists in finding a message (called the solution), and the server will determine whether or not the solution is correct by ensuring the hash is correct
// The helper is sent to the client, to help him to find the solution. Note that the helper is public, so don't put anything sensitive in here
export const Challenge = z.object({
  helper: z.string(),
  hash: z.string(),
});
export type IChallenge = z.infer<typeof Challenge>;

// Represents a document
export interface IDocument {
  id: string, // uuid
  cypher: string, // Cypher of the data
  hash: string, // Hash of the cypher
  readChallenges: IChallenge[], // Challenge to complete by the client to read the document
  writeChallenges: IChallenge[], // Challenge to complete by the client to edit the document
}

// Represents an user. Basically a pointer to a document (you can actually use a different IAM service, the only thing you need it a link to the auth document)
export interface IUser {
  email: string,
  initialDocId: string, // The id of the doc containing the credentials
}

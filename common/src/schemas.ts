
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
export const Document = z.object({
  id: z.string(), // uuid
  cypher: z.string(), // Cypher of the data
  hash: z.string(), // Hash of the cypher
  readChallenges: z.array(Challenge), // Challenge to complete by the client to read the document
  writeChallenges: z.array(Challenge), // Challenge to complete by the client to edit the document
});
export type IDocument = z.infer<typeof Document>;

// Represents an user. Basically a pointer to a document (you can actually use a different IAM service, the only thing you need it a link to the auth document)
export const User = z.object({
  email: z.string(),
  initialDocId: z.string(), // The id of the doc containing the credentials
});
export type IUser = z.infer<typeof User>;

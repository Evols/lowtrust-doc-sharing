
import express from 'express';
import { IncomingHttpHeaders } from 'http';
import { waitForDebugger } from 'inspector';
import * as lowdb from 'lowdb';
import { hash, verify } from 'tweetnacl';
import { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

// The challenge consists in finding a message, of which "cypher" is a cypher. The message can be verified thanks to its hash
// This is used to ensure the client has a given permission: the challenge's cypher is sent to the client, who then sends the deciphered message, and the server verifies it with the hash
const Challenge = z.object({
  cypher: z.string(),
  hash: z.string(),
});
type IChallenge = z.infer<typeof Challenge>;

interface IDocument {
  id: string, // uuid
  cypher: string,
  hash: string,
  readChallenges: IChallenge[],
  writeChallenges: IChallenge[],
}

interface IDbData {
  documents: IDocument[],
}

type IAuthCheckResult = {
  success: true,
  doc: IDocument,
} | {
  success: false,
  errorCode: number,
};

function checkAuth(docId: string, headers: IncomingHttpHeaders, db: lowdb.Low<IDbData>, challengeType: 'readChallenges' | 'writeChallenges'): IAuthCheckResult {
  const authorization = headers.authorization;
  const authPrefix = 'Challenge ';
  if (authorization === undefined || !authorization.startsWith(authPrefix)) {
    return {
      success: false,
      errorCode: 400,
    };
  }

  const challengeStr = authorization.substr(0, authPrefix.length);
  const challenge = decodeBase64(challengeStr);
  const challengeHash = hash(challenge);

  // Get the doc from DB
  const doc = db.data?.documents.find(doc => doc.id === docId);
  if (doc === undefined) {
    return {
      success: false,
      errorCode: 404,
    };
  }
  // Check this document has the 
  if (doc[challengeType].filter(readChallenge => verify(decodeBase64(readChallenge.hash), challengeHash)).length === 0) {
    return {
      success: false,
      errorCode: 401,
    };
  }

  return {
    success: true,
    doc: doc,
  };

}

const adapter = new lowdb.JSONFile<IDbData>('db.json');
const db = new lowdb.Low<IDbData>(adapter);

db.data ??= {
  documents: [],
};

const app = express();

// Get the challenges for a given document
app.get('/document/challenges/:id', async function (req, res) {

  const docId = req.params['id'];
  await db.read();

  const doc = db.data?.documents.find(doc => doc.id === docId);
  if (doc === undefined) {
    return res.status(404).end();
  }

  res.json({
    readChallenges: doc.readChallenges,
    writeChallenges: doc.writeChallenges,
  });

});

// Get the given document
app.get('/document/:id', async function (req, res) {
  // Check auth and get document
  const docId = req.params['id'];
  await db.read();
  const result = checkAuth(docId, req.headers, db, 'readChallenges');

  // If there was an error, handle it
  if (!result.success) {
    return res.status(result.errorCode);
  }

  // Send the document
  return res.json({
    cypher: result.doc.cypher,
    hash: result.doc.hash,
  });
});

app.post('/document', async function (req, res) {

  const body = z.object({
    cypher: z.string(),
    hash: z.string(),
    readChallenges: z.array(Challenge),
    writeChallenges: z.array(Challenge),
  }).parse(req.body);

  const docId = uuid();
  db.data?.documents.push({
    id: docId,
    ...body,
  });
  await db.write();

  return res.json({
    id: docId,
  });
});

app.listen(5000);

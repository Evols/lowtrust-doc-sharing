
import { createDocument, createUser, getDocument, getUser } from './database';
import express from 'express';
import { IncomingHttpHeaders } from 'http';
import { hash, verify } from 'tweetnacl';
import { decodeBase64 } from 'tweetnacl-util';
import { z } from 'zod';
import { IDocument, Challenge } from 'ltds_common/schemas';

type IAuthCheckResult = {
  success: true,
  doc: IDocument,
} | {
  success: false,
  errorCode: number,
};

function checkAuth(doc: IDocument, headers: IncomingHttpHeaders, challengeType: 'readChallenges' | 'writeChallenges'): IAuthCheckResult {
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

const app = express();

// Get the challenges for a given document
app.get('/document/challenges/:id', async function (req, res) {

  const docId = req.params['id'];
  const doc = await getDocument(docId);

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
  const doc = await getDocument(docId);

  if (doc === undefined) {
    return res.status(404).end();
  }

  const result = checkAuth(doc, req.headers, 'readChallenges');

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

// Creates a document. An alternative way of implementing this might be using a "right to post" token, bought separately using crypto
app.post('/document', async function (req, res) {

  const body = z.object({
    cypher: z.string(),
    hash: z.string(),
    readChallenges: z.array(Challenge),
    writeChallenges: z.array(Challenge),
  }).parse(req.body);

  const docId = await createDocument(body);

  return res.json({
    id: docId,
  });
});

// Gets an user, with a link to his initial document.
app.get('/user', async function (req, res) {

  const query = z.object({
    email: z.string(),
  }).parse(req.query);

  const user = await getUser(query.email);

  if (user === undefined) {
    return res.status(404).end();
  }

  return res.json(user);
});

// Creates an user, with a link to his initial document.
app.post('/user', async function (req, res) {

  const body = z.object({
    email: z.string(),
    cipheredPassword: z.string(),
    passwordAdditionalInfo: z.string(),
    initialDocId: z.string(),
  }).parse(req.body);

  const userId = await createUser(body);

  return res.json({
    userId,
  });
});

app.listen(5000);

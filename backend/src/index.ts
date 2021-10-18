
import { createRecord, createUser, getRecord, getUser } from './database';
import express from 'express';
import { IncomingHttpHeaders } from 'http';
import { hash, verify } from 'tweetnacl';
import { decodeBase64 } from 'tweetnacl-util';
import { z } from 'zod';
import { IRecord, Challenge } from 'ltds_common/dist/schemas';
import cors from 'cors';
import morgan from 'morgan';

type IAuthCheckResult = {
  success: true,
  doc: IRecord,
} | {
  success: false,
  errorCode: number,
};

function checkAuth(doc: IRecord, headers: IncomingHttpHeaders, challengeType: 'readChallenges' | 'writeChallenges'): IAuthCheckResult {
  const authorization = headers.authorization;
  const authPrefix = 'Challenges ';
  if (authorization === undefined || !authorization.startsWith(authPrefix)) {
    return {
      success: false,
      errorCode: 400,
    };
  }

  const challengeStrs = authorization.substr(authPrefix.length, authorization.length).split(' ').filter((_, i) => i < doc[challengeType].length); // Limit the number of challenges
  const challengesHashes = challengeStrs.map(challenge => hash(decodeBase64(challenge)));

  // Check this record has at least one valid challenge
  if (doc[challengeType].filter(
    readChallenge => challengesHashes.filter(
      sentChallengeHash => verify(decodeBase64(readChallenge.hash), sentChallengeHash)
    ).length > 0
  ).length === 0) {
    return {
      success: false,
      errorCode: 401,
    };
  }

  return {
    success: true,
    doc,
  };

}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Get the challenges for a given record
app.get('/record/challenges/:id', async function (req, res) {

  const docId = req.params['id'];
  const doc = await getRecord(docId);

  if (doc === undefined) {
    return res.status(404).end();
  }

  res.json({
    readChallenges: doc.readChallenges,
    writeChallenges: doc.writeChallenges,
  });

});

// Get the given record
app.get('/record/:id', async function (req, res) {
  // Check auth and get record
  const docId = req.params['id'];
  const doc = await getRecord(docId);

  if (doc === undefined) {
    return res.status(404).end();
  }

  const result = checkAuth(doc, req.headers, 'readChallenges');

  // If there was an error, handle it
  if (!result.success) {
    return res.status(result.errorCode).end();
  }

  // Send the record
  return res.json(result.doc);
});

// Creates a record. An alternative way of implementing this might be using a "right to post" token, bought separately using crypto
app.post('/record', async function (req, res) {

  const body = z.object({
    cypher: z.string(),
    hash: z.string(),
    readChallenges: z.array(Challenge),
    writeChallenges: z.array(Challenge),
  }).parse(req.body);

  const docId = await createRecord(body);

  return res.json({
    id: docId,
  });
});

// Gets an user, with a link to his initial record.
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

// Creates an user, with a link to his initial record.
app.post('/user', async function (req, res) {

  const body = z.object({
    email: z.string(),
    initialDocId: z.string(),
  }).parse(req.body);

  const existingUser = await getUser(body.email);
  if (existingUser !== undefined) {
    return res.status(403).end();
  }

  const userId = await createUser(body);

  return res.json({
    userId,
  });
});

app.listen(5000);

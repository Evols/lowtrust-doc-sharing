
import express from 'express';
import * as lowdb from 'lowdb';

// The challenge consists in finding a message, of which "cypher" is a cypher. The message can be verified thanks to its hash
// This is used to ensure the client has a given permission: the challenge's cypher is sent to the client, who then sends the deciphered message, and the server verifies it with the hash
interface Challenge {
  cypher: string,
  hash: string,
}

interface DbData {
  documents: {
    id: string, // uuid
    cypher: string,
    hash: string,
    readChallenges: Challenge[],
    writeChallenges: Challenge[],
  }[],
}

const adapter = new lowdb.JSONFile<DbData>('db.json');
const db = new lowdb.Low<DbData>(adapter);

db.data ??= {
  documents: [],
};

const app = express();

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

app.get('/document/:id', function (req, res) {
  res.send('Hello World! doc');
});

app.put('/document/:id', function (req, res) {
  res.send('Hello World!');
});

app.listen(5000);

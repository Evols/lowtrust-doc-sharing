
import express from 'express';
import { JSONFile, Low } from 'lowdb';

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

const adapter = new JSONFile<DbData>('db.json');
const db = new Low<DbData>(adapter);

const app = express();

app.get('/document/challenges/:id', function (req, res) {
  res.send('Hello World!');
});

app.get('/document/:id', function (req, res) {
  res.send('Hello World!');
});

app.put('/document/:id', function (req, res) {
  res.send('Hello World!');
});

app.listen(5000);

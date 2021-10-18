"use strict";
exports.__esModule = true;
exports.User = exports.Record = exports.Challenge = void 0;
var zod_1 = require("zod");
// A challenge is used to ensure the client can access (read or write) a given record 
// The challenge consists in finding a message (called the solution), and the server will determine whether or not the solution is correct by ensuring the hash is correct
// The helper is sent to the client, to help him to find the solution. Note that the helper is public, so don't put anything sensitive in here
exports.Challenge = zod_1.z.object({
    helper: zod_1.z.string(),
    hash: zod_1.z.string()
});
// Represents a record
exports.Record = zod_1.z.object({
    id: zod_1.z.string(),
    cypher: zod_1.z.string(),
    hash: zod_1.z.string(),
    readChallenges: zod_1.z.array(exports.Challenge),
    writeChallenges: zod_1.z.array(exports.Challenge)
});
// Represents an user. Basically a pointer to a record (you can actually use a different IAM service, the only thing you need it a link to the auth record)
exports.User = zod_1.z.object({
    email: zod_1.z.string(),
    initialDocId: zod_1.z.string()
});

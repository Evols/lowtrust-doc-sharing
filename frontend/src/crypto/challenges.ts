
import { IChallenge } from 'ltds_common/dist/schemas';
import { randomBytes, secretbox, hash } from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { kdf } from './common';

const challengeKeyDerivationLength = 32;

/// Secret based challenge
// The secret can be sensitive enough not to be shared with the server, as the challenge's solution is actually key-derived from the secret

async function _buildSecretBasedSolution(secret: Uint8Array, kdfSalt: Uint8Array, hashSalt: Uint8Array) {
  const keyDerived = await kdf(secret, kdfSalt, challengeKeyDerivationLength);
  return Uint8Array.from([ ...hashSalt, ...keyDerived, ]);
}

export async function buildSecretBasedChallenge(secret: Uint8Array): Promise<IChallenge> {
  const kdfSalt = randomBytes(secretbox.keyLength);
  const hashSalt = randomBytes(hash.hashLength);
  const solution = await _buildSecretBasedSolution(secret, kdfSalt, hashSalt);
  const hashed = hash(solution);
  return {
    helper: encodeBase64(Uint8Array.from([ ...kdfSalt, ...hashSalt, ])),
    hash: encodeBase64(hashed),
  };
}

// Builds the solution of a challenge that was created by buildSecretBasedChallenge
export async function buildSecretBasedSolution(secret: Uint8Array, helper: string): Promise<string> {
  const helperBin = decodeBase64(helper);
  const kdfSalt = helperBin.subarray(0, secretbox.keyLength);
  const hashSalt = helperBin.subarray(secretbox.keyLength, secretbox.keyLength + challengeKeyDerivationLength);
  const solution = await _buildSecretBasedSolution(secret, kdfSalt, hashSalt);
  return encodeBase64(solution);
}

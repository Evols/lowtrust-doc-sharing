
import { randomBytes, secretbox, hash } from 'tweetnacl';
import { decodeUTF8 } from 'tweetnacl-util';
import { kdf } from './common';

export async function passwordToSymKey(password: string) {
  const salt = randomBytes(secretbox.keyLength);
  return {
    salt,
    derivedKey: await kdf(
      decodeUTF8(password),
      salt,
      secretbox.keyLength,
    ),
  };
}

export type TKeyVault<MetadataType extends { type: string }> = {
  metadata: MetadataType,
  cypher: Uint8Array,
  nonce: Uint8Array,
  hash: Uint8Array,
};

export function genKeyVault<MetadataType extends { type: string }>(masterSymKey: Uint8Array, masterPrivateKey: Uint8Array, vaultSymKey: Uint8Array, metadata: MetadataType): TKeyVault<MetadataType> {
  const jsonBytes = decodeUTF8(JSON.stringify({
    masterSymKey,
    masterPrivateKey,
  }));
  const jsonBytesHash = hash(jsonBytes);
  const jsonCypherNonce = randomBytes(secretbox.nonceLength);
  const jsonBytesCypher = secretbox(jsonBytes, jsonCypherNonce, vaultSymKey);
  return {
    metadata,
    cypher: jsonBytesCypher,
    nonce: jsonCypherNonce,
    hash: jsonBytesHash,
  }
}

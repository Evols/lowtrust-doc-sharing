
import { randomBytes, secretbox, hash } from 'tweetnacl';
import { decodeUTF8, encodeBase64 } from 'tweetnacl-util';
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
  cypher: string, // Base64 encoded
  nonce: string, // Base64 encoded
  hash: string, // Base64 encoded
};

export function genKeyVault<MetadataType extends { type: string }>(masterSymKey: Uint8Array, masterPrivateKey: Uint8Array, vaultSymKey: Uint8Array, metadata: MetadataType): TKeyVault<MetadataType> {
  const jsonBytes = decodeUTF8(JSON.stringify({
    masterSymKey: encodeBase64(masterSymKey),
    masterPrivateKey: encodeBase64(masterPrivateKey),
  }));
  const jsonBytesHash = hash(jsonBytes);
  const jsonCypherNonce = randomBytes(secretbox.nonceLength);
  const jsonBytesCypher = secretbox(jsonBytes, jsonCypherNonce, vaultSymKey);
  return {
    metadata,
    cypher: encodeBase64(jsonBytesCypher),
    nonce: encodeBase64(jsonCypherNonce),
    hash: encodeBase64(jsonBytesHash),
  }
}


import { randomBytes, secretbox } from 'tweetnacl';
import { decodeUTF8, encodeBase64 } from 'tweetnacl-util';
import { kdf } from './common';
import { z } from 'zod';

export async function passwordToSecretKey(password: string, salt: Uint8Array) {
  return await kdf(
    decodeUTF8(password),
    salt,
    secretbox.keyLength,
  );
}

const MetadataType = z.object({
  type: z.literal('failsafe'),
}).or(z.object({
  type: z.literal('password'),
  salt: z.string(),
}));

export type IMetadataType = z.infer<typeof MetadataType>;

export const KeyVault = z.object({
  cypher: z.string(),
  nonce: z.string(),
  metadata: MetadataType,
});

export type IKeyVault = z.infer<typeof KeyVault>;

export const KeyVaultContent = z.object({
  masterSecretKey: z.string(),
  masterBoxKey: z.string(),
  masterSignKey: z.string(),
  directoryId: z.string(),
});

export type IKeyVaultContent = z.infer<typeof KeyVaultContent>;

export function genKeyVault(masterSecretKey: Uint8Array, masterBoxKey: Uint8Array, masterSignKey: Uint8Array, directoryId: string, vaultSecretKey: Uint8Array, metadata: IMetadataType): IKeyVault {

  const keyVaultContent: IKeyVaultContent = {
    masterSecretKey: encodeBase64(masterSecretKey),
    masterBoxKey: encodeBase64(masterBoxKey),
    masterSignKey: encodeBase64(masterSignKey),
    directoryId,
  };

  const jsonBytes = decodeUTF8(JSON.stringify(keyVaultContent));

  const jsonCypherNonce = randomBytes(secretbox.nonceLength);
  const jsonBytesCypher = secretbox(jsonBytes, jsonCypherNonce, vaultSecretKey);
  return {
    metadata,
    cypher: encodeBase64(jsonBytesCypher),
    nonce: encodeBase64(jsonCypherNonce),
    // No need for a hash, as NaCl authentifies the message
  }
}

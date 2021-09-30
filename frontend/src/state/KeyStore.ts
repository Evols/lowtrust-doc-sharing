
import axios from 'axios';
import { useState } from 'react';
import scrypt from 'scrypt-async-modern';
import { randomBytes, secretbox, box, hash } from 'tweetnacl';
import { decodeUTF8, encodeBase64 } from 'tweetnacl-util';
import { createContainer } from 'unstated-next';


function useKeyStore() {
  const [userId, setUserId] = useState<Uint8Array | undefined>(undefined);
  const [masterSymKey, setMasterSymKey] = useState<Uint8Array | undefined>(undefined);
  const [url, setUrl] = useState<string>('http://localhost:5000');

  async function passwordToSymKey(password: string) {
    const salt = randomBytes(secretbox.keyLength);
    return {
      salt,
      derivedKey: await scrypt(
        decodeUTF8(password),
        salt,
        {
          logN: 12, // TODO: benchmark this
          dkLen: secretbox.keyLength,
          encoding: 'binary',
        },
      ),
    };
  }

  function genKeyVault<MetadataType extends { type: string }>(masterSymKey: Uint8Array, masterPrivateKey: Uint8Array, vaultSymKey: Uint8Array, metadata: MetadataType) {
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

  async function registerWithPassword(password: string) {
    const masterSymKey = randomBytes(secretbox.keyLength);
    const masterAsymKeys = box.keyPair();
    const failsafeSymKey = randomBytes(secretbox.keyLength);
    const loginSymKey = await passwordToSymKey(password);
    const res = await axios.post(
      `${url}/document`,
      {
        cypher: JSON.stringify({
          vaults: [
            genKeyVault(masterSymKey, masterAsymKeys.secretKey, failsafeSymKey, { type: 'failsafe' }),
            genKeyVault(masterSymKey, masterAsymKeys.secretKey, loginSymKey.derivedKey, { type: 'password', salt: loginSymKey.salt }),
          ],
        }),
        hash: '',
      }
    );

    setMasterSymKey(masterSymKey);
  }

  return {
    userId,
    registerWithPassword,
    isLoggedIn: masterSymKey !== undefined,
  };
}

export const KeyStore = createContainer(useKeyStore);

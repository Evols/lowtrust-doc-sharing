
import { useState } from 'react';
import { useHistory } from 'react-router';
import { BoxKeyPair, SignKeyPair } from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';
import { createContainer } from 'unstated-next';
import { registerWithPassword as cryptoRegisterWithPassword, loginWithPassword as cryptoLoginWithPassword } from '../crypto/highLevel';
import { downloadFile } from '../utils/downloader';

function useKeyStore() {

  const [masterSecretKey, setMasterSecretKey] = useState<Uint8Array | undefined>(undefined);
  const [masterBoxKeyPair, setMasterBoxKeyPair] = useState<BoxKeyPair | undefined>(undefined);
  const [masterSignKeyPair, setMasterSignKeyPair] = useState<SignKeyPair | undefined>(undefined);
  const [directoryDocId, setDirectoryDocId] = useState<string | undefined>(undefined);
  const [url, setUrl] = useState<string>('http://localhost:5000');

  async function registerWithPassword(email: string, password: string, history: ReturnType<typeof useHistory>) {
    const registerResult = await cryptoRegisterWithPassword(url, email, password);
    if (registerResult === false) {
      console.log('User already exists');
      return;
    }
    setMasterSecretKey(registerResult.masterSecretKey);
    setMasterBoxKeyPair(registerResult.masterBoxKeyPair);
    setMasterSignKeyPair(registerResult.masterSignKeyPair);
    setDirectoryDocId(registerResult.directoryDocId);

    downloadFile(`failsafe-key-ltds.txt`, encodeBase64(registerResult.failsafeSecretKey));

    history.push('/signup/completed');
  }

  async function loginWithPassword(email: string, password: string, history: ReturnType<typeof useHistory>) {
    const loginResult = await cryptoLoginWithPassword(url, email, password);
    if (loginResult === false) {
      console.log('Wrong password or user doesn\'t exist or your credentials were tampered with');
      return;
    }
    setMasterSecretKey(loginResult.masterSecretKey);
    setMasterBoxKeyPair(loginResult.masterBoxKeyPair);
    setMasterSignKeyPair(loginResult.masterSignKeyPair);
    setDirectoryDocId(loginResult.directoryDocId);

    history.push('/documents');
  }

  return {
    registerWithPassword,
    loginWithPassword,
    directoryDocId,
    isLoggedIn: masterSecretKey !== undefined,
  };
}

export const KeyStore = createContainer(useKeyStore);

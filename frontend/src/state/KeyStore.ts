
import { useState } from 'react';
import { BoxKeyPair, SignKeyPair } from 'tweetnacl';
import { createContainer } from 'unstated-next';
import { registerWithPassword as cryptoRegisterWithPassword, loginWithPassword as cryptoLoginWithPassword } from '../crypto/highLevel';


function useKeyStore() {
  const [masterSecretKey, setMasterSecretKey] = useState<Uint8Array | undefined>(undefined);
  const [masterBoxKeyPair, setMasterBoxKeyPair] = useState<BoxKeyPair | undefined>(undefined);
  const [masterSignKeyPair, setMasterSignKeyPair] = useState<SignKeyPair | undefined>(undefined);
  const [directoryDocId, setDirectoryDocId] = useState<string | undefined>(undefined);
  const [url, setUrl] = useState<string>('http://localhost:5000');
  
  console.log('directoryDocId:', directoryDocId);

  async function registerWithPassword(email: string, password: string) {
    const registerResult = await cryptoRegisterWithPassword(url, email, password);
    if (registerResult === false) {
      console.log('User already exists');
      return;
    }
    setMasterSecretKey(registerResult.masterSecretKey);
    setMasterBoxKeyPair(registerResult.masterBoxKeyPair);
    setMasterSignKeyPair(registerResult.masterSignKeyPair);
  }

  async function loginWithPassword(email: string, password: string) {
    const loginResult = await cryptoLoginWithPassword(url, email, password);
    if (loginResult === false) {
      console.log('Wrong password or user doesn\'t exist or your credentials were tampered with');
      return;
    }
    setMasterSecretKey(loginResult.masterSecretKey);
    setMasterBoxKeyPair(loginResult.masterBoxKeyPair);
    setMasterSignKeyPair(loginResult.masterSignKeyPair);
    setDirectoryDocId(loginResult.directoryDocId);
  }

  return {
    registerWithPassword,
    loginWithPassword,
    isLoggedIn: masterSecretKey !== undefined,
  };
}

export const KeyStore = createContainer(useKeyStore);


import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { registerWithPassword as cryptoRegisterWithPassword, loginWithPassword as cryptoLoginWithPassword } from '../crypto/highLevel';


function useKeyStore() {
  const [masterSymKey, setMasterSymKey] = useState<Uint8Array | undefined>(undefined);
  const [url, setUrl] = useState<string>('http://localhost:5000');

  async function registerWithPassword(email: string, password: string) {
    const masterKey = await cryptoRegisterWithPassword(url, email, password);
    if (masterKey === false) {
      console.log('User already exists');
      return;
    }
    setMasterSymKey(masterKey);
  }

  async function loginWithPassword(email: string, password: string) {
    const masterKey = await cryptoLoginWithPassword(url, email, password);
    if (masterKey === false) {
      console.log('Wrong password or user doesn\'t exist');
      return;
    }
    setMasterSymKey(masterKey);
  }

  return {
    registerWithPassword,
    loginWithPassword,
    isLoggedIn: masterSymKey !== undefined,
  };
}

export const KeyStore = createContainer(useKeyStore);

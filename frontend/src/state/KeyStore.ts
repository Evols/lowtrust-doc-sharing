
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { registerWithPassword as cryptoRegisterWithPassword } from '../crypto/highLevel';


function useKeyStore() {
  const [userId, setUserId] = useState<Uint8Array | undefined>(undefined);
  const [masterSymKey, setMasterSymKey] = useState<Uint8Array | undefined>(undefined);
  const [url, setUrl] = useState<string>('http://localhost:5000');

  async function registerWithPassword(email: string, password: string) {
    setMasterSymKey(await cryptoRegisterWithPassword(url, email, password));
  }

  return {
    userId,
    registerWithPassword,
    isLoggedIn: masterSymKey !== undefined,
  };
}

export const KeyStore = createContainer(useKeyStore);

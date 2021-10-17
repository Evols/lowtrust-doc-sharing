
import { useEffect, useState } from 'react';
import { BoxKeyPair, SignKeyPair, box, sign } from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';
import { createContainer } from 'unstated-next';
import { registerWithPassword as cryptoRegisterWithPassword, loginWithPassword as cryptoLoginWithPassword } from '../crypto/highLevel';
import { downloadFile } from '../utils/downloader';

function useKeyStore() {

  const [masterSecretKey, _setMasterSecretKey] = useState<Uint8Array | undefined>(undefined);
  const [masterBoxKeyPair, _setMasterBoxKeyPair] = useState<BoxKeyPair | undefined>(undefined);
  const [masterSignKeyPair, _setMasterSignKeyPair] = useState<SignKeyPair | undefined>(undefined);
  const [directoryDocId, _setDirectoryDocId] = useState<string | undefined>(undefined);
  const [url, setUrl] = useState<string>('http://localhost:5000');

  const isLoggedIn = masterSecretKey !== undefined;

  function storeKeys(masterSecretKey: Uint8Array, masterBoxKeyPair: BoxKeyPair, masterSignKeyPair: SignKeyPair, directoryDocId: string) {
    _setMasterSecretKey(masterSecretKey);
    _setMasterBoxKeyPair(masterBoxKeyPair);
    _setMasterSignKeyPair(masterSignKeyPair);
    _setDirectoryDocId(directoryDocId);
    sessionStorage.setItem('authenticated', 'true');
    sessionStorage.setItem('masterSecretKey', encodeBase64(masterSecretKey!));
    sessionStorage.setItem('masterBoxKey', encodeBase64(masterBoxKeyPair!.secretKey));
    sessionStorage.setItem('masterSignKey', encodeBase64(masterSignKeyPair!.secretKey));
    sessionStorage.setItem('directoryDocId', directoryDocId!);
  }

  function removeStoredKeys() {
    _setMasterSecretKey(undefined);
    _setMasterBoxKeyPair(undefined);
    _setMasterSignKeyPair(undefined);
    _setDirectoryDocId(undefined);
    sessionStorage.removeItem('authenticated');
    sessionStorage.removeItem('masterSecretKey');
    sessionStorage.removeItem('masterBoxKey');
    sessionStorage.removeItem('masterSignKey');
    sessionStorage.removeItem('directoryDocId');
  }

  function signOut() {
    removeStoredKeys();
  }

  function gatherKeysFromStorage() {
    const authenticated = sessionStorage.getItem('authenticated');
    if (authenticated === 'true') {
      const storageMasterSecretKey = decodeBase64(sessionStorage.getItem('masterSecretKey')!);
      const storageMasterBoxKey = decodeBase64(sessionStorage.getItem('masterBoxKey')!);
      const storageMasterSignKey = decodeBase64(sessionStorage.getItem('masterSignKey')!);
      const storageDirectoryDocId = sessionStorage.getItem('directoryDocId')!;
      storeKeys(
        storageMasterSecretKey,
        box.keyPair.fromSecretKey(storageMasterBoxKey),
        sign.keyPair.fromSecretKey(storageMasterSignKey),
        storageDirectoryDocId,
      );
    }
  }

  useEffect(gatherKeysFromStorage, []);

  async function registerWithPassword(email: string, password: string) {
    const registerResult = await cryptoRegisterWithPassword(url, email, password);
    if (registerResult === false) {
      console.log('User already exists');
      return false;
    }
    storeKeys(
      registerResult.masterSecretKey,
      registerResult.masterBoxKeyPair,
      registerResult.masterSignKeyPair,
      registerResult.directoryDocId,
    );

    downloadFile(`failsafe-key-ltds.txt`, encodeBase64(registerResult.failsafeSecretKey));

    return true;
  }

  async function loginWithPassword(email: string, password: string) {

    const loginResult = await cryptoLoginWithPassword(url, email, password);
    if (loginResult === false) {
      console.log('Wrong password or user doesn\'t exist or your credentials were tampered with');
      return false;
    }

    storeKeys(
      loginResult.masterSecretKey,
      loginResult.masterBoxKeyPair,
      loginResult.masterSignKeyPair,
      loginResult.directoryDocId,
    );

    return true;
  }

  return {
    registerWithPassword,
    loginWithPassword,
    signOut,
    directoryDocId,
    isLoggedIn,
  };
}

export const KeyStore = createContainer(useKeyStore);

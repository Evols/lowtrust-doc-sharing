
import { useEffect, useState } from 'react';
import { BoxKeyPair, SignKeyPair, box, sign } from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';
import { createContainer } from 'unstated-next';
import { registerWithPassword as cryptoRegisterWithPassword, loginWithPassword as cryptoLoginWithPassword, resetPassword as cryptoResetPassword } from '../crypto/authentication';
import { downloadFile } from '../utils/downloader';

function useKeyStore() {

  const [masterSecretKey, _setMasterSecretKey] = useState<Uint8Array | undefined>(undefined);
  const [masterBoxKeyPair, _setMasterBoxKeyPair] = useState<BoxKeyPair | undefined>(undefined);
  const [masterSignKeyPair, _setMasterSignKeyPair] = useState<SignKeyPair | undefined>(undefined);
  const [directoryDocId, _setDirectoryDocId] = useState<string | undefined>(undefined);

  const [url, setUrl] = useState<string>('http://localhost:5000');

  const isLoggedIn = masterSecretKey !== undefined;

  console.log('useKeyStore masterSecretKey', encodeBase64(masterSecretKey ?? new Uint8Array()), 'directoryDocId', directoryDocId);

  function storeKeys(newMasterSecretKey: Uint8Array, newMasterBoxKeyPair: BoxKeyPair, newMasterSignKeyPair: SignKeyPair, newDirectoryDocId: string) {
    _setMasterSecretKey(newMasterSecretKey);
    _setMasterBoxKeyPair(newMasterBoxKeyPair);
    _setMasterSignKeyPair(newMasterSignKeyPair);
    _setDirectoryDocId(newDirectoryDocId);

    console.log('storeKeys masterSecretKey', encodeBase64(masterSecretKey ?? new Uint8Array()), '->', encodeBase64(newMasterSecretKey));
    console.log('storeKeys directoryDocId', directoryDocId, '->', newDirectoryDocId);

    sessionStorage.setItem('authenticated', 'true');
    sessionStorage.setItem('masterSecretKey', encodeBase64(newMasterSecretKey!));
    sessionStorage.setItem('masterBoxKey', encodeBase64(newMasterBoxKeyPair!.secretKey));
    sessionStorage.setItem('masterSignKey', encodeBase64(newMasterSignKeyPair!.secretKey));
    sessionStorage.setItem('directoryDocId', newDirectoryDocId!);
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
      console.log('gatherKeysFromStorage storageMasterSecretKey', encodeBase64(storageMasterSecretKey ?? new Uint8Array()), 'storageDirectoryDocId', storageDirectoryDocId);
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

  async function resetPassword(email: string, newPassword: string, failsafeSecretKey: string) {

    const loginResult = await cryptoResetPassword(url, email, newPassword, failsafeSecretKey);
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
    resetPassword,
    signOut,
    masterSecretKey,
    directoryDocId,
    url,
    isLoggedIn,
  };
}

export const KeyStore = createContainer(useKeyStore);

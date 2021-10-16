
import scrypt from 'scrypt-async-modern';

export async function kdf(key: Uint8Array, salt: Uint8Array, dkLen: number) {
  return await scrypt(
    key,
    salt,
    {
      logN: 12, // TODO: benchmark this
      dkLen,
      encoding: 'binary',
    },
  );
}

import CryptoJs from "crypto-js";

export function encrypt<T>(data: T, token: string): string {
  const encryptedData = CryptoJs.AES.encrypt(
    JSON.stringify(data),
    token
  ).toString();
  return encryptedData;
}

export function decrypt<T>(encryptedData: string, token: string): T {
  const bytes = CryptoJs.AES.decrypt(encryptedData, token).toString(
    CryptoJs.enc.Utf8
  );
  const decryptedData = JSON.parse(bytes);
  return decryptedData as T;
}

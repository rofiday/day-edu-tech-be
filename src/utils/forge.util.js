import forge from "node-forge";
import { Buffer } from "buffer";
import jwt from "jsonwebtoken";

//function untuk generate session
export const generateSessionKey = (req, res) => {
  const key = forge.random.getBytesSync(16);
  const payload = {
    key,
  };
  res.status(200).json({
    __unknown_session: jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30s",
    }),
  });
};

//function untuk mengembalikan enkripsi (decrypt)
export const decryptPayload = (compositeHash) => {
  try {
    const encryptedData = JSON.parse(
      Buffer.from(compositeHash.__unknown, "base64").toString("utf-8")
    );
    const {
      payload: encryptedPayload,
      key: encryptedSymmetricKey,
      session,
      iv,
      hmac: receivedHmac,
    } = encryptedData;
    jwt.verify(session, process.env.JWT_SECRET);
    const pemPrivateKey = Buffer.from(
      process.env.APP_PRIVATE_KEY,
      "base64"
    ).toString("utf-8");
    const privateKey = forge.pki.privateKeyFromPem(pemPrivateKey);
    const symmetricKey = privateKey.decrypt(
      forge.util.decode64(encryptedSymmetricKey),
      "RSA-OAEP"
    );
    const hmac = forge.hmac.create();
    hmac.start("sha256", session);
    hmac.update(forge.util.decode64(encryptedPayload));
    const computedHmac = hmac.digest().toHex();
    //kondisi untuk cek kondisi jika comHmac tidak sama dengan receivedHmac
    if (computedHmac !== receivedHmac) {
      //mengembalikan error
      return { error: true, meessage: "failed to process Request" };
    }
    const decipher = forge.cipher.createDecipher("AES-CBC", symmetricKey);
    decipher.start({ iv: forge.util.decode64(iv) });
    decipher.update(
      forge.util.createBuffer(forge.util.decode64(encryptedPayload))
    );
    decipher.finish();
    return JSON.parse(decipher.output.toString("utf-8"));
  } catch (error) {
    console.log(error.message);
    console.error("failed to process the request");
    throw new Error("failed to process the request");
  }
};

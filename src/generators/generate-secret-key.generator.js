import crypto from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ override: true });

class SecretKeyGenerator {
  static generateRandomKey(length = 32) {
    return crypto.randomBytes(length).toString("hex");
  }
  static generateKeyFromPassphrase(passphrase, salt) {
    const usedSalt = salt || crypto.randomBytes(16).toString("hex");
    const key = crypto.pbkdf2Sync(passphrase, usedSalt, 100000, 32, "sha512");
    return key.toString("hex");
  }
  static generateUUIDBasedKey() {
    return crypto.randomUUID().replace(/-/g, "");
  }
  static generateAdvancedKey() {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString("hex");
    const processEnv = process.pid.toString();
    const combinedEntropy = `${timestamp}-${randomBytes}-${processEnv}`;
    return crypto.createHash("sha256").update(combinedEntropy).digest("hex");
  }
  static validateSecretKey(key) {
    const strengthRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{32,}$/;
    return strengthRegex.test(key);
  }
  static rotateKey(currentKey) {
    const newKey = this.generateRandomKey();
    return {
      newKey: newKey,
      oldKey: currentKey,
    };
  }
}

const generateSecretKey = () => {
  const ENV_PATH = path.resolve(process.cwd(), ".env");
  const keyName = "APP_SECRET_KEY";
  const secretKey = SecretKeyGenerator.generateRandomKey();
  let envContent = "";
  if (fs.existsSync(ENV_PATH)) {
    envContent = fs.readFileSync(ENV_PATH, "utf8");
  }
  const keyRegex = new RegExp(`^${keyName}=.*$`, "m");
  if (keyRegex.test(envContent)) {
    envContent = envContent.replace(keyRegex, `${keyName}=${secretKey}`);
  } else {
    envContent += `\n${keyName}=${secretKey}`;
  }
  fs.writeFileSync(ENV_PATH, envContent.trim() + "\n");
  console.log("Secret key has been generated successfully.");
};

const run = () => {
  try {
    generateSecretKey();
  } catch (error) {
    console.log(error.message);
  }
};

run();

export { generateSecretKey };

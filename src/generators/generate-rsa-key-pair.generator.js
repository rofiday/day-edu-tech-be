import forge from "node-forge";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ override: true });

const targetPath = "./src/secrets";
const generateRSAKeyPairFile = () => {
  const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
  const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
  fs.writeFileSync(targetPath + "/private_key.pem", privateKeyPem);
  fs.writeFileSync(targetPath + "/public_key.pem", publicKeyPem);
  console.log("RSA key pair file has been generated successfully.");
};

function generateRSAKeyPair() {
  const ENV_PATH = path.resolve(process.cwd(), ".env");
  let envContent = "";
  if (fs.existsSync(ENV_PATH)) {
    envContent = fs.readFileSync(ENV_PATH, "utf8");
  }
  const updateOrAddEnvVar = (content, varName, value) => {
    const regex = new RegExp(`^${varName}=.*$`, "m");
    const encodedValue = Buffer.from(value).toString("base64");
    if (regex.test(content)) {
      return content.replace(regex, `${varName}=${encodedValue}`);
    } else {
      return content + `\n${varName}=${encodedValue}`;
    }
  };
  const privateKey = fs.readFileSync(targetPath + "/private_key.pem", "utf8");
  const publicKey = fs.readFileSync(targetPath + "/public_key.pem", "utf8");
  envContent = updateOrAddEnvVar(envContent, "APP_PRIVATE_KEY", privateKey);
  envContent = updateOrAddEnvVar(envContent, "APP_PUBLIC_KEY", publicKey);
  fs.writeFileSync(ENV_PATH, envContent.trim() + "\n");
  console.log("RSA key pair has been generated successfully.");
}

const run = () => {
  try {
    generateRSAKeyPairFile();
    generateRSAKeyPair();
  } catch (error) {
    console.log(error.message);
  }
};

run();

export { generateRSAKeyPairFile, generateRSAKeyPair };

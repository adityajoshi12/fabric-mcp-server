import "dotenv/config";
import { Wallets, X509Identity } from "fabric-network";
import * as fs from "fs";
import * as path from "path";

async function createWallet() {
  // Configuration - update these paths or use command line arguments
  const privateKeyPath = process.argv[2] || process.env.PRIVATE_KEY_PATH;
  const certificatePath = process.argv[3] || process.env.CERTIFICATE_PATH;
  const mspId = process.argv[4] || process.env.FABRIC_MSP_ID || "Org1MSP";
  const userId = process.argv[5] || process.env.FABRIC_USER_ID || "appUser";
  const walletPath = process.env.FABRIC_WALLET_PATH || "./wallet";

  if (!privateKeyPath || !certificatePath) {
    console.error("Usage: npx ts-node create-wallet.ts <privateKeyPath> <certificatePath> [mspId] [userId]");
    console.error("\nOr set environment variables:");
    console.error("  PRIVATE_KEY_PATH - Path to private key file");
    console.error("  CERTIFICATE_PATH - Path to certificate file");
    console.error("  FABRIC_MSP_ID - MSP ID (default: Org1MSP)");
    console.error("  FABRIC_USER_ID - User ID (default: appUser)");
    console.error("  FABRIC_WALLET_PATH - Wallet directory (default: ./wallet)");
    process.exit(1);
  }

  try {
    // Read the private key and certificate
    const privateKey = fs.readFileSync(path.resolve(privateKeyPath), "utf8");
    const certificate = fs.readFileSync(path.resolve(certificatePath), "utf8");

    console.log(`Creating wallet at: ${walletPath}`);
    console.log(`MSP ID: ${mspId}`);
    console.log(`User ID: ${userId}`);

    // Create the wallet
    const wallet = await Wallets.newFileSystemWallet(path.resolve(walletPath));

    // Check if identity already exists
    const existingIdentity = await wallet.get(userId);
    if (existingIdentity) {
      console.log(`\nIdentity "${userId}" already exists in wallet. Removing...`);
      await wallet.remove(userId);
    }

    // Create the X509 identity
    const identity: X509Identity = {
      credentials: {
        certificate: certificate,
        privateKey: privateKey,
      },
      mspId: mspId,
      type: "X.509",
    };

    // Store the identity in the wallet
    await wallet.put(userId, identity);

    console.log(`\n✅ Successfully created identity "${userId}" in wallet`);
    console.log(`\nWallet contents:`);
    const identities = await wallet.list();
    identities.forEach((id) => console.log(`  - ${id}`));

  } catch (error) {
    console.error("Error creating wallet:", error);
    process.exit(1);
  }
}

createWallet();


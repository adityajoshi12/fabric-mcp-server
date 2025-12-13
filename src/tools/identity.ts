import { Wallets } from "fabric-network";
import { FabricClient } from "../fabric-client.js";

export async function listEnrolledIdentities(client: FabricClient) {
  const config = client.getConfig();
  const wallet = await Wallets.newFileSystemWallet(config.walletPath);
  const identities = await wallet.list();

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(identities, null, 2),
      },
    ],
  };
}


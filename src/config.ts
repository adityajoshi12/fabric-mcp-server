import * as path from "path";
import { FabricConfig } from "./types.js";

export function loadConfig(): FabricConfig {
  return {
    channelName: process.env.FABRIC_CHANNEL || "mychannel",
    chaincodeName: process.env.FABRIC_CHAINCODE || "basic",
    mspId: process.env.FABRIC_MSP_ID || "Org1MSP",
    walletPath: process.env.FABRIC_WALLET_PATH || path.join(process.cwd(), "wallet"),
    connectionProfilePath: process.env.FABRIC_CONNECTION_PROFILE || path.join(process.cwd(), "connection-profile.json"),
    userId: process.env.FABRIC_USER_ID || "appUser",
  };
}


import { Gateway } from "fabric-network";

export interface FabricConfig {
  channelName: string;
  chaincodeName: string;
  mspId: string;
  walletPath: string;
  connectionProfilePath: string;
  userId: string;
}

export interface ToolResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
}

export interface FabricContext {
  gateway: Gateway;
  config: FabricConfig;
}


import { Gateway, Wallets } from "fabric-network";
import * as fs from "fs";
import { FabricConfig } from "./types.js";

export class FabricClient {
  private gateway: Gateway | null = null;
  private config: FabricConfig;

  constructor(config: FabricConfig) {
    this.config = config;
  }

  async connect(): Promise<Gateway> {
    if (this.gateway) return this.gateway;

    try {
      const wallet = await Wallets.newFileSystemWallet(this.config.walletPath);
      const identity = await wallet.get(this.config.userId);

      if (!identity) {
        throw new Error(`Identity ${this.config.userId} not found in wallet`);
      }

      const connectionProfile = JSON.parse(
        fs.readFileSync(this.config.connectionProfilePath, "utf8")
      );

      this.gateway = new Gateway();
      await this.gateway.connect(connectionProfile, {
        wallet,
        identity: this.config.userId,
        discovery: { enabled: true, asLocalhost: true },
      });

      return this.gateway;
    } catch (error) {
      throw new Error(`Failed to connect to Fabric: ${error}`);
    }
  }

  getGateway(): Gateway | null {
    return this.gateway;
  }

  getConfig(): FabricConfig {
    return this.config;
  }

  async disconnect(): Promise<void> {
    if (this.gateway) {
      this.gateway.disconnect();
      this.gateway = null;
    }
  }
}


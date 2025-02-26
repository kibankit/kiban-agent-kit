import { PublicClient, WalletClient, formatEther, Chain } from "viem";

export interface WalletTools {
  getAddress(): string;
  getBalance(): Promise<string>;
  getChainInfo(): Promise<ChainInfo>;
}

export interface ChainInfo {
  name: string;
  id: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export function createWalletTools(
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain
): WalletTools {
  return {
    getAddress() {
      return walletClient.account?.address || "";
    },

    async getBalance() {
      if (!walletClient.account) {
        throw new Error("No wallet connected");
      }

      const balance = await publicClient.getBalance({
        address: walletClient.account.address,
      });

      return formatEther(balance);
    },

    async getChainInfo() {
      return {
        name: chain.name,
        id: chain.id,
        nativeCurrency: chain.nativeCurrency,
      };
    },
  };
}

// Export the wallet service
export * from "./service";

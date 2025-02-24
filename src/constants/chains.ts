import { Chain, defineChain } from "viem";
import { mainnet } from "viem/chains";

// We'll define Katana chain when we have the official parameters
export const katana = defineChain({
  id: 0, // to be updated with official chain ID
  name: "Katana",
  network: "katana",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [""], // To be updated with official RPC
    },
    public: {
      http: [""], // To be updated with official public RPC
    },
  },
});

// Default RPC URLs for supported chains
export const DEFAULT_RPC_URLS: Record<number, string> = {
  [mainnet.id]: "https://eth.public-rpc.com",
  [katana.id]: "", // To be updated
};

// Supported chains
export const SUPPORTED_CHAINS: Chain[] = [mainnet, katana];

// Chain name mapping
export const CHAIN_NAMES: Record<number, string> = {
  [mainnet.id]: "mainnet",
  [katana.id]: "katana",
};

import { Chain, Address, Transport, PublicClient, WalletClient } from "viem";
import { mainnet } from "viem/chains";

export interface TokenData {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
  priceUsd?: string;
  volume24h?: string;
  liquidity?: string;
}

export interface WalletConfig {
  privateKey: `0x${string}`; // Viem requires hex string with 0x prefix
  rpcUrl?: string;
  chain?: Chain;
}

export interface TokenBalance {
  token: Address;
  balance: string;
  symbol: string;
  decimals: number;
}

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  volume24h: string;
  fdv?: number;
}

// Viem client types
export interface Clients {
  public: PublicClient;
  wallet: WalletClient;
}

export * from "./token";

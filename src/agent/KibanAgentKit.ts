import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
  WalletClient,
  Account,
  Hash,
  Chain,
  isAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { WalletConfig } from "../types";
import { createWalletTools, WalletTools } from "../tools/wallet";
import { createTokenTools, TokenTools } from "../tools/token";
import { SUPPORTED_CHAINS, DEFAULT_RPC_URLS } from "../constants/chains";

export class KibanAgentKit {
  private clients: {
    public: PublicClient;
    wallet: WalletClient;
  };
  private account: Account;
  private chain: Chain;
  private walletTools: WalletTools;
  private tokenTools: TokenTools;

  constructor(config: WalletConfig) {
    // Validate private key
    if (!config.privateKey) {
      throw new Error(
        "Private key is required. Please provide a valid private key in your configuration."
      );
    }
    if (
      typeof config.privateKey !== "string" ||
      !config.privateKey.startsWith("0x")
    ) {
      throw new Error(
        "Invalid private key format. Private key must be a hex string starting with '0x'."
      );
    }

    // Set up chain configuration
    this.chain = config.chain || mainnet;

    // Validate chain support
    if (!SUPPORTED_CHAINS.find((c) => c.id === this.chain.id)) {
      throw new Error(
        `Chain ${this.chain.id} is not supported. Supported chains are: ${SUPPORTED_CHAINS.map((c) => c.name).join(", ")}`
      );
    }

    // Set up RPC URL
    const rpcUrl = config.rpcUrl || DEFAULT_RPC_URLS[this.chain.id];
    if (!rpcUrl) {
      throw new Error(
        `No RPC URL provided for chain ${this.chain.name} (ID: ${this.chain.id}). Please provide a valid RPC URL in your configuration.`
      );
    }

    try {
      // Create account from private key
      this.account = privateKeyToAccount(config.privateKey);

      // Create public and wallet clients
      this.clients = {
        public: createPublicClient({
          chain: this.chain,
          transport: http(rpcUrl),
        }),
        wallet: createWalletClient({
          chain: this.chain,
          transport: http(rpcUrl),
          account: this.account,
        }),
      };

      // Initialize tools
      this.walletTools = createWalletTools(
        this.clients.public,
        this.clients.wallet,
        this.chain
      );
      this.tokenTools = createTokenTools(
        this.clients.public,
        this.clients.wallet,
        this.chain
      );

      console.log(
        `🔗 Connected to ${this.chain.name} (Chain ID: ${this.chain.id})`
      );
    } catch (err) {
      const error = err as Error;
      if (error.message.includes("invalid private key")) {
        throw new Error(
          `Invalid private key: The provided private key is not in the correct format. Please ensure it's a valid 32-byte hex string starting with '0x'.`
        );
      } else if (error.message.includes("network")) {
        throw new Error(
          `Network error: Failed to connect to RPC URL ${rpcUrl}. Please check your internet connection and RPC URL validity.`
        );
      } else {
        throw new Error(
          `Failed to initialize Kiban Agent: ${error.message}. Please check your configuration and try again.`
        );
      }
    }
  }

  // Wallet operations
  getAddress(): string {
    return this.walletTools.getAddress();
  }

  getChainId(): number {
    return this.chain.id;
  }

  async getChainInfo() {
    return this.walletTools.getChainInfo();
  }

  async getNativeBalance(): Promise<string> {
    return this.walletTools.getBalance();
  }

  // Token operations
  async checkToken(tokenAddressOrSymbol: string) {
    return this.tokenTools.checkToken(tokenAddressOrSymbol);
  }

  async sendTokens(
    params: Parameters<TokenTools["sendTokens"]>[0]
  ): Promise<Hash> {
    return this.tokenTools.sendTokens(params);
  }

  async approveSpending(
    params: Parameters<TokenTools["approveSpending"]>[0]
  ): Promise<Hash> {
    return this.tokenTools.approveSpending(params);
  }

  async getTokenMetadata(tokenAddress: string) {
    return this.tokenTools.getTokenMetadata(tokenAddress);
  }

  async getAllowance(
    params: Parameters<TokenTools["getAllowance"]>[0]
  ): Promise<bigint> {
    return this.tokenTools.getAllowance(params);
  }

  async waitForTransaction(hash: Hash) {
    return this.tokenTools.waitForTransaction(hash);
  }
}

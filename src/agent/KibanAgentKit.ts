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
    // Set up chain configuration
    this.chain = config.chain || mainnet;

    // Validate chain support
    if (!SUPPORTED_CHAINS.find((c) => c.id === this.chain.id)) {
      throw new Error(`Chain ${this.chain.id} is not supported`);
    }

    // Set up RPC URL
    const rpcUrl = config.rpcUrl || DEFAULT_RPC_URLS[this.chain.id];
    if (!rpcUrl) {
      throw new Error(`No RPC URL provided for chain ${this.chain.id}`);
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
      throw new Error(`Failed to initialize clients: ${error.message}`);
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

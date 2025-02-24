import {
  PublicClient,
  WalletClient,
  formatUnits,
  parseUnits,
  Address,
  Hash,
  isAddress,
  Chain,
  Account,
} from "viem";
import { ERC20_ABI } from "./abi";

export interface TokenTools {
  checkToken(tokenAddressOrSymbol: string): Promise<TokenInfo>;
  sendTokens(params: SendTokenParams): Promise<Hash>;
  approveSpending(params: ApproveParams): Promise<Hash>;
  getTokenMetadata(tokenAddress: string): Promise<TokenMetadata>;
  getAllowance(params: AllowanceParams): Promise<bigint>;
  waitForTransaction(hash: Hash): Promise<TransactionResult>;
}

export interface TokenInfo {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  balanceRaw: bigint;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

export interface SendTokenParams {
  token: string;
  to: string;
  amount: string;
  options?: {
    slippageTolerance?: number;
  };
}

export interface ApproveParams {
  token: string;
  spender: string;
  amount: string;
}

export interface AllowanceParams {
  token: string;
  owner: string;
  spender: string;
}

export interface TransactionResult {
  hash: Hash;
  wait: () => Promise<TransactionReceipt>;
}

export interface TransactionReceipt {
  status: "success" | "failure";
  hash: Hash;
  blockNumber: bigint;
  gasUsed: bigint;
}

export function createTokenTools(
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain
): TokenTools {
  function ensureAddress(address: string): Address {
    if (!isAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }
    return address as Address;
  }

  return {
    async checkToken(tokenAddressOrSymbol: string) {
      if (!walletClient.account) {
        throw new Error("No wallet connected");
      }

      // Validate/convert address
      if (!isAddress(tokenAddressOrSymbol)) {
        throw new Error("Token address lookup not implemented yet");
      }

      const address = tokenAddressOrSymbol as Address;

      // Get token data
      const [name, symbol, decimals, balanceRaw] = await Promise.all([
        publicClient.readContract({
          address,
          abi: ERC20_ABI,
          functionName: "name",
        }) as Promise<string>,
        publicClient.readContract({
          address,
          abi: ERC20_ABI,
          functionName: "symbol",
        }) as Promise<string>,
        publicClient.readContract({
          address,
          abi: ERC20_ABI,
          functionName: "decimals",
        }) as Promise<number>,
        publicClient.readContract({
          address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [walletClient.account.address],
        }) as Promise<bigint>,
      ]);

      return {
        address,
        name,
        symbol,
        decimals,
        balanceRaw,
        balance: formatUnits(balanceRaw, decimals),
      };
    },

    async sendTokens(params: SendTokenParams) {
      if (!walletClient.account) {
        throw new Error("No wallet connected");
      }

      // Handle native token (ETH) transfer
      if (params.token.toLowerCase() === "eth") {
        return walletClient.sendTransaction({
          account: walletClient.account,
          chain,
          to: ensureAddress(params.to),
          value: parseUnits(params.amount, 18),
        });
      }

      // Handle ERC20 transfer
      if (!isAddress(params.token)) {
        throw new Error("Token address lookup not implemented yet");
      }

      const tokenAddress = params.token as Address;
      const token = await this.checkToken(params.token);

      const { request } = await publicClient.simulateContract({
        account: walletClient.account.address,
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [
          ensureAddress(params.to),
          parseUnits(params.amount, token.decimals),
        ],
        chain,
      });

      return walletClient.writeContract(request);
    },

    async approveSpending(params: ApproveParams) {
      if (!walletClient.account) {
        throw new Error("No wallet connected");
      }

      if (!isAddress(params.token)) {
        throw new Error("Token address lookup not implemented yet");
      }

      const tokenAddress = params.token as Address;
      const token = await this.checkToken(params.token);

      const { request } = await publicClient.simulateContract({
        account: walletClient.account.address,
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [
          ensureAddress(params.spender),
          parseUnits(params.amount, token.decimals),
        ],
        chain,
      });

      return walletClient.writeContract(request);
    },

    async getTokenMetadata(tokenAddress: string) {
      const address = ensureAddress(tokenAddress);
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        publicClient.readContract({
          address,
          abi: ERC20_ABI,
          functionName: "name",
        }) as Promise<string>,
        publicClient.readContract({
          address,
          abi: ERC20_ABI,
          functionName: "symbol",
        }) as Promise<string>,
        publicClient.readContract({
          address,
          abi: ERC20_ABI,
          functionName: "decimals",
        }) as Promise<number>,
        publicClient.readContract({
          address,
          abi: ERC20_ABI,
          functionName: "totalSupply",
        }) as Promise<bigint>,
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply,
      };
    },

    async getAllowance(params: AllowanceParams) {
      const allowance = await publicClient.readContract({
        address: ensureAddress(params.token),
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [ensureAddress(params.owner), ensureAddress(params.spender)],
      });

      return allowance as bigint;
    },

    async waitForTransaction(hash: Hash) {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        hash: receipt.transactionHash,
        wait: async () => {
          return {
            status: receipt.status === "success" ? "success" : "failure",
            hash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed,
          };
        },
      };
    },
  };
}

import { KibanAgentKit } from "../../agent/KibanAgentKit";
import { Address, Hash } from "viem";

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
}

export interface TransactionReceipt {
  status: "success" | "failure";
  hash: Hash;
  blockNumber: bigint;
  gasUsed: bigint;
}

/**
 * Core token service for token-related operations
 */
export class TokenService {
  constructor(private agent: KibanAgentKit) {}

  /**
   * Get information about a token
   */
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    return this.agent.checkToken(tokenAddress);
  }

  /**
   * Send tokens (ETH or ERC20)
   */
  async sendTokens(params: SendTokenParams): Promise<TransactionResult> {
    const txHash = await this.agent.sendTokens(params);
    // We're just returning the hash here
    return {
      hash: txHash,
    };
  }

  /**
   * Wait for a transaction to be confirmed
   */
  async waitForTransaction(hash: Hash): Promise<any> {
    return this.agent.waitForTransaction(hash);
  }

  /**
   * Approve token spending
   */
  async approveSpending(params: ApproveParams): Promise<TransactionResult> {
    const txHash = await this.agent.approveSpending(params);
    // We're just returning the hash here
    return {
      hash: txHash,
    };
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(tokenAddress: string): Promise<TokenMetadata> {
    return this.agent.getTokenMetadata(tokenAddress);
  }

  /**
   * Get token allowance
   */
  async getAllowance(params: AllowanceParams): Promise<bigint> {
    return this.agent.getAllowance(params);
  }
}

import { KibanAgentKit } from "../../agent/KibanAgentKit";

export interface WalletInfo {
  address: string;
  balance: string;
  chain: {
    name: string;
    id: number;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
  };
  message: string;
}

export interface TransactionHistory {
  message: string;
  transactionCount?: number;
  viewOnEtherscan?: string;
  transactions?: any[];
}

export interface GasEstimate {
  currentGasPrice: string;
  estimatedBaseFee: string;
  transactionDetails?: {
    gasUnits: string;
    estimatedCostWei: string;
    estimatedCostEth: string;
    message: string;
    error?: string;
  };
}

/**
 * Core wallet service for wallet-related operations
 */
export class WalletService {
  constructor(private agent: KibanAgentKit) {}

  /**
   * Get information about the connected wallet
   */
  async getWalletInfo(): Promise<WalletInfo> {
    const address = this.agent.getAddress();
    const balance = await this.agent.getNativeBalance();
    const chainInfo = await this.agent.getChainInfo();

    return {
      address,
      balance: `${balance} ETH`,
      chain: {
        name: chainInfo.name,
        id: chainInfo.id,
        nativeCurrency: chainInfo.nativeCurrency,
      },
      message: `This wallet (${address}) is connected to ${chainInfo.name} with a balance of ${balance} ETH.`,
    };
  }

  /**
   * Get transaction history for the connected wallet
   */
  async getTransactionHistory(limit: number = 5): Promise<TransactionHistory> {
    const address = this.agent.getAddress();

    // Get the public client from the agent
    const publicClient = this.agent["clients"].public;

    // Get transactions from the connected wallet
    const sentTxs = await publicClient.getTransactionCount({
      address: address as `0x${string}`,
      blockTag: "latest",
    });

    if (sentTxs === 0) {
      return {
        message: `No transactions found for wallet ${address}`,
        transactions: [],
      };
    }

    // Since viem doesn't have a direct "get transactions" method,
    // we'll return a message explaining the limitation
    return {
      message: `This wallet (${address}) has sent ${sentTxs} transactions. To view detailed transaction history, please use a block explorer like Etherscan.`,
      transactionCount: sentTxs,
      viewOnEtherscan: `https://etherscan.io/address/${address}`,
    };
  }

  /**
   * Estimate gas prices and transaction costs
   */
  async estimateGas(to?: string, value?: string): Promise<GasEstimate> {
    // Get the public client from the agent
    const publicClient = this.agent["clients"].public;

    // Get current gas price
    const gasPrice = await publicClient.getGasPrice();

    // Format gas price in gwei
    const gasPriceGwei = gasPrice.toString();

    let result: GasEstimate = {
      currentGasPrice: `${gasPriceGwei} gwei`,
      estimatedBaseFee: `${gasPriceGwei} gwei`,
    };

    // If to and value are provided, estimate transaction cost
    if (to && value) {
      try {
        const valueInWei = BigInt(value);
        const gasEstimate = await publicClient.estimateGas({
          account: this.agent.getAddress() as `0x${string}`,
          to: to as `0x${string}`,
          value: valueInWei,
        });

        const estimatedCost = gasEstimate * gasPrice;

        result.transactionDetails = {
          gasUnits: gasEstimate.toString(),
          estimatedCostWei: estimatedCost.toString(),
          estimatedCostEth: (Number(estimatedCost) / 1e18).toString(),
          message: `Estimated cost for this transaction: ${Number(estimatedCost) / 1e18} ETH (${gasEstimate} gas units at ${gasPriceGwei} gwei)`,
        };
      } catch (error: any) {
        result.transactionDetails = {
          gasUnits: "0",
          estimatedCostWei: "0",
          estimatedCostEth: "0",
          message: "Failed to estimate gas",
          error: error.message,
        };
      }
    }

    return result;
  }
}

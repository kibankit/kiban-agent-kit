import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { KibanAgentKit } from "../agent/KibanAgentKit";
import { WalletService } from "../tools/wallet";
import { formatEther } from "viem";

/**
 * LangChain tool for checking native token (ETH) balance
 */
export class EvmBalanceTool extends StructuredTool {
  name = "check_eth_balance";
  description = "Get the native ETH balance of a wallet address";
  schema = z.object({
    address: z.string().describe("The wallet address to check balance for"),
  });

  constructor(private agent: KibanAgentKit) {
    super();
  }

  protected async _call(input: z.input<typeof this.schema>) {
    const balance = await this.agent.getNativeBalance();
    const formattedBalance = formatEther(BigInt(balance));
    return `${formattedBalance} ETH`;
  }
}

/**
 * LangChain tool for transferring ETH or ERC20 tokens
 */
export class EvmTransferTool extends StructuredTool {
  name = "transfer_tokens";
  description = "Transfer ETH or ERC20 tokens to another address";
  schema = z.object({
    to: z.string().describe("The recipient wallet address"),
    amount: z.string().describe("The amount to transfer"),
    tokenAddress: z
      .string()
      .optional()
      .describe("Optional ERC20 token address. If not provided, sends ETH"),
  });

  constructor(private agent: KibanAgentKit) {
    super();
  }

  protected async _call(input: z.input<typeof this.schema>) {
    try {
      if (!input.tokenAddress) {
        // Send ETH
        const tx = await this.agent.sendTokens({
          token: "eth",
          to: input.to,
          amount: input.amount,
        });
        return `ETH transfer transaction sent: ${tx}`;
      } else {
        // Send ERC20
        const tx = await this.agent.sendTokens({
          token: input.tokenAddress,
          to: input.to,
          amount: input.amount,
        });
        return `Token transfer transaction sent: ${tx}`;
      }
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  }
}

/**
 * LangChain tool for getting wallet information
 */
export class WalletInfoTool extends StructuredTool {
  name = "get_wallet_info";
  description =
    "Get information about the currently connected wallet including address, balance, and chain";
  schema = z.object({});

  private service: WalletService;

  constructor(agent: KibanAgentKit) {
    super();
    this.service = new WalletService(agent);
  }

  protected async _call(): Promise<string> {
    try {
      const walletInfo = await this.service.getWalletInfo();
      return JSON.stringify(walletInfo, null, 2);
    } catch (error: any) {
      return `Error retrieving wallet information: ${error.message}`;
    }
  }
}

/**
 * LangChain tool for estimating gas
 */
export class GasEstimatorTool extends StructuredTool {
  name = "estimate_gas";
  description = "Get current gas prices and estimate transaction costs";
  schema = z.object({
    to: z
      .string()
      .optional()
      .describe("Optional recipient address for transaction cost estimation"),
    value: z
      .string()
      .optional()
      .describe("Optional amount in ETH for transaction cost estimation"),
  });

  private service: WalletService;

  constructor(agent: KibanAgentKit) {
    super();
    this.service = new WalletService(agent);
  }

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    try {
      const gasEstimate = await this.service.estimateGas(input.to, input.value);
      return JSON.stringify(gasEstimate, null, 2);
    } catch (error: any) {
      return `Error estimating gas: ${error.message}`;
    }
  }
}

/**
 * LangChain tool for retrieving transaction history
 */
export class TransactionHistoryTool extends StructuredTool {
  name = "get_transaction_history";
  description = "Get recent transactions for the connected wallet";
  schema = z.object({
    limit: z
      .number()
      .optional()
      .describe("Maximum number of transactions to return (default: 5)"),
  });

  private service: WalletService;

  constructor(agent: KibanAgentKit) {
    super();
    this.service = new WalletService(agent);
  }

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    try {
      const history = await this.service.getTransactionHistory(
        input.limit || 5
      );
      return JSON.stringify(history, null, 2);
    } catch (error: any) {
      return `Error retrieving transaction history: ${error.message}`;
    }
  }
}

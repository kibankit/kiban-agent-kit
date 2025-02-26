import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { KibanAgentKit } from "../../agent/KibanAgentKit";
import { formatEther, formatUnits } from "viem";

/**
 * Tool for retrieving transaction history for the connected wallet
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

  constructor(private agent: KibanAgentKit) {
    super();
  }

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    try {
      const address = this.agent.getAddress();
      const limit = input.limit || 5;

      // Get the public client from the agent
      const publicClient = this.agent["clients"].public;

      // Get recent blocks
      const blockNumber = await publicClient.getBlockNumber();
      const startBlock = blockNumber - BigInt(10000); // Look back ~10000 blocks (roughly 1-2 days)

      // Get transactions from the connected wallet
      const sentTxs = await publicClient.getTransactionCount({
        address: address as `0x${string}`,
        blockTag: "latest",
      });

      if (sentTxs === 0) {
        return JSON.stringify(
          {
            message: `No transactions found for wallet ${address}`,
            transactions: [],
          },
          null,
          2
        );
      }

      // Since viem doesn't have a direct "get transactions" method,
      // we'll return a message explaining the limitation
      return JSON.stringify(
        {
          message: `This wallet (${address}) has sent ${sentTxs} transactions. To view detailed transaction history, please use a block explorer like Etherscan.`,
          transactionCount: sentTxs,
          viewOnEtherscan: `https://etherscan.io/address/${address}`,
        },
        null,
        2
      );

      // Note: In a production environment, you would typically:
      // 1. Use an indexer API like Etherscan, Alchemy, or The Graph
      // 2. Maintain a local cache of transactions
      // 3. Implement pagination for large transaction histories
    } catch (error: any) {
      return `Error retrieving transaction history: ${error.message}`;
    }
  }
}

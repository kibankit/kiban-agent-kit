import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { KibanAgentKit } from "../../agent/KibanAgentKit";
import { formatEther, formatGwei, parseEther } from "viem";

/**
 * Tool for estimating gas prices and transaction costs
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

  constructor(private agent: KibanAgentKit) {
    super();
  }

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    try {
      // Get the public client from the agent
      const publicClient = this.agent["clients"].public;

      // Get current gas price
      const gasPrice = await publicClient.getGasPrice();

      // Format gas price in gwei
      const gasPriceGwei = formatGwei(gasPrice);

      let result: any = {
        currentGasPrice: `${gasPriceGwei} gwei`,
        estimatedBaseFee: `${formatGwei(gasPrice)} gwei`,
      };

      // If to and value are provided, estimate transaction cost
      if (input.to && input.value) {
        try {
          const gasEstimate = await publicClient.estimateGas({
            account: this.agent.getAddress() as `0x${string}`,
            to: input.to as `0x${string}`,
            value: parseEther(input.value),
          });

          const estimatedCost = gasEstimate * gasPrice;

          result.transactionDetails = {
            gasUnits: gasEstimate.toString(),
            estimatedCostWei: estimatedCost.toString(),
            estimatedCostEth: formatEther(estimatedCost),
            message: `Estimated cost for this transaction: ${formatEther(estimatedCost)} ETH (${gasEstimate} gas units at ${gasPriceGwei} gwei)`,
          };
        } catch (error: any) {
          result.transactionDetails = {
            error: `Failed to estimate gas: ${error.message}`,
          };
        }
      }

      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error estimating gas: ${error.message}`;
    }
  }
}

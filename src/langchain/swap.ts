import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { KibanAgentKit } from "../agent/KibanAgentKit";
import { SwapService } from "../tools/token/swap";

/**
 * LangChain tool for getting a swap quote
 */
export class GetSwapQuoteTool extends StructuredTool {
  name = "get_swap_quote";
  description =
    "Get a quote for swapping tokens, including expected output amount and price impact";
  schema = z.object({
    tokenIn: z
      .string()
      .describe("The input token address or symbol (e.g., 'ETH', 'USDC')"),
    tokenOut: z
      .string()
      .describe("The output token address or symbol (e.g., 'ETH', 'USDC')"),
    amount: z.string().describe("The amount of input token to swap"),
    slippagePercentage: z
      .number()
      .optional()
      .describe("Optional slippage tolerance percentage (default: 0.5)"),
  });

  private service: SwapService;

  constructor(agent: KibanAgentKit) {
    super();
    this.service = new SwapService(agent);
  }

  protected async _call(input: z.input<typeof this.schema>) {
    try {
      const quote = await this.service.getSwapQuote({
        tokenIn: input.tokenIn,
        tokenOut: input.tokenOut,
        amount: input.amount,
        slippagePercentage: input.slippagePercentage,
      });

      return JSON.stringify(
        {
          tokenIn: {
            symbol: quote.tokenIn.symbol,
            amount: quote.tokenIn.amount,
          },
          tokenOut: {
            symbol: quote.tokenOut.symbol,
            amount: quote.tokenOut.amount,
          },
          executionPrice: quote.executionPrice,
          minimumAmountOut: quote.minimumAmountOut,
          priceImpact: quote.priceImpact,
          message: `You can swap ${quote.tokenIn.amount} ${quote.tokenIn.symbol} for approximately ${quote.tokenOut.amount} ${quote.tokenOut.symbol} (minimum: ${quote.minimumAmountOut} ${quote.tokenOut.symbol}).`,
        },
        null,
        2
      );
    } catch (error: any) {
      return `Error getting swap quote: ${error.message}`;
    }
  }
}

/**
 * LangChain tool for executing a token swap
 */
export class SwapTokensTool extends StructuredTool {
  name = "swap_tokens";
  description = "Execute a token swap using Uniswap V3";
  schema = z.object({
    tokenIn: z
      .string()
      .describe("The input token address or symbol (e.g., 'ETH', 'USDC')"),
    tokenOut: z
      .string()
      .describe("The output token address or symbol (e.g., 'ETH', 'USDC')"),
    amount: z.string().describe("The amount of input token to swap"),
    slippagePercentage: z
      .number()
      .optional()
      .describe("Optional slippage tolerance percentage (default: 0.5)"),
    recipient: z
      .string()
      .optional()
      .describe("Optional recipient address (default: sender's address)"),
  });

  private service: SwapService;

  constructor(agent: KibanAgentKit) {
    super();
    this.service = new SwapService(agent);
  }

  protected async _call(input: z.input<typeof this.schema>) {
    try {
      // First get a quote to show the user what to expect
      const quote = await this.service.getSwapQuote({
        tokenIn: input.tokenIn,
        tokenOut: input.tokenOut,
        amount: input.amount,
        slippagePercentage: input.slippagePercentage,
      });

      // Execute the swap
      const result = await this.service.swapTokens({
        tokenIn: input.tokenIn,
        tokenOut: input.tokenOut,
        amount: input.amount,
        slippagePercentage: input.slippagePercentage,
        recipient: input.recipient,
      });

      return JSON.stringify(
        {
          transactionHash: result.hash,
          tokenIn: result.tokenIn,
          tokenOut: result.tokenOut,
          amountIn: result.amountIn,
          expectedAmountOut: result.expectedAmountOut,
          message: `Successfully swapped ${result.amountIn} ${result.tokenIn} for approximately ${result.expectedAmountOut} ${result.tokenOut}. Transaction hash: ${result.hash}`,
        },
        null,
        2
      );
    } catch (error: any) {
      return `Error executing swap: ${error.message}`;
    }
  }
}

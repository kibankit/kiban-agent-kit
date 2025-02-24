import { z } from "zod";
import { formatEther } from "viem";
import { KibanAgentKit } from "../agent/KibanAgentKit";
import { StructuredTool } from "@langchain/core/tools";
import {
  GetTokenDataTool,
  SearchTokenByTickerTool,
} from "../tools/dexscreener/get_token_data";

/**
 * Tool for checking native token (ETH) balance
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
 * Tool for transferring ETH or ERC20 tokens
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
 * Tool for checking ERC20 token information and balance
 */
export class TokenInfoTool extends StructuredTool {
  name = "check_token_info";
  description =
    "Get information about an ERC20 token including name, symbol, decimals and balance";
  schema = z.object({
    tokenAddress: z.string().describe("The ERC20 token contract address"),
    walletAddress: z
      .string()
      .optional()
      .describe("Optional wallet address to check balance for"),
  });

  constructor(private agent: KibanAgentKit) {
    super();
  }

  protected async _call(input: z.input<typeof this.schema>) {
    const tokenInfo = await this.agent.checkToken(input.tokenAddress);
    return JSON.stringify(
      {
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        balance: tokenInfo.balance,
      },
      null,
      2
    );
  }
}

/**
 * Creates all available tools for the Kiban Agent Kit
 */
export function createKibanTools(
  agent: KibanAgentKit
): Array<
  | EvmBalanceTool
  | EvmTransferTool
  | TokenInfoTool
  | GetTokenDataTool
  | SearchTokenByTickerTool
> {
  return [
    new EvmBalanceTool(agent),
    new EvmTransferTool(agent),
    new TokenInfoTool(agent),
    new GetTokenDataTool(),
    new SearchTokenByTickerTool(),
  ];
}

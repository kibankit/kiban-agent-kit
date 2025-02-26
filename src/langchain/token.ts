import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { KibanAgentKit } from "../agent/KibanAgentKit";
import { TokenService } from "../tools/token";

/**
 * LangChain tool for checking ERC20 token information and balance
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

  private service: TokenService;

  constructor(agent: KibanAgentKit) {
    super();
    this.service = new TokenService(agent);
  }

  protected async _call(input: z.input<typeof this.schema>) {
    try {
      const tokenInfo = await this.service.getTokenInfo(input.tokenAddress);
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
    } catch (error: any) {
      return `Error getting token info: ${error.message}`;
    }
  }
}

/**
 * LangChain tool for approving token spending
 */
export class TokenApprovalTool extends StructuredTool {
  name = "approve_token_spending";
  description =
    "Approve a spender to use a specific amount of your ERC20 tokens";
  schema = z.object({
    tokenAddress: z.string().describe("The ERC20 token contract address"),
    spenderAddress: z.string().describe("The address to approve as spender"),
    amount: z.string().describe("The amount to approve"),
  });

  private service: TokenService;

  constructor(agent: KibanAgentKit) {
    super();
    this.service = new TokenService(agent);
  }

  protected async _call(input: z.input<typeof this.schema>) {
    try {
      const result = await this.service.approveSpending({
        token: input.tokenAddress,
        spender: input.spenderAddress,
        amount: input.amount,
      });

      return `Approval transaction sent: ${result.hash}`;
    } catch (error: any) {
      return `Error approving token spending: ${error.message}`;
    }
  }
}

/**
 * LangChain tool for checking token allowance
 */
export class TokenAllowanceTool extends StructuredTool {
  name = "check_token_allowance";
  description =
    "Check how much of a token a spender is allowed to use on behalf of an owner";
  schema = z.object({
    tokenAddress: z.string().describe("The ERC20 token contract address"),
    ownerAddress: z.string().describe("The token owner's address"),
    spenderAddress: z.string().describe("The spender's address"),
  });

  private service: TokenService;

  constructor(agent: KibanAgentKit) {
    super();
    this.service = new TokenService(agent);
  }

  protected async _call(input: z.input<typeof this.schema>) {
    try {
      const allowance = await this.service.getAllowance({
        token: input.tokenAddress,
        owner: input.ownerAddress,
        spender: input.spenderAddress,
      });

      return `Allowance: ${allowance.toString()}`;
    } catch (error: any) {
      return `Error checking allowance: ${error.message}`;
    }
  }
}

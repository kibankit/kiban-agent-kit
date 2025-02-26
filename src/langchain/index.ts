import { StructuredTool } from "@langchain/core/tools";
import { KibanAgentKit } from "../agent/KibanAgentKit";

// Import tools from their respective files
import { GetTokenDataTool, SearchTokenByTickerTool } from "./dexscreener";

import {
  EvmBalanceTool,
  EvmTransferTool,
  WalletInfoTool,
  GasEstimatorTool,
  TransactionHistoryTool,
} from "./wallet";

import { TokenInfoTool, TokenApprovalTool, TokenAllowanceTool } from "./token";

/**
 * Creates all available tools for the Kiban Agent Kit
 */
export function createKibanTools(agent: KibanAgentKit): Array<StructuredTool> {
  return [
    // Wallet tools
    new EvmBalanceTool(agent),
    new EvmTransferTool(agent),
    new WalletInfoTool(agent),
    new GasEstimatorTool(agent),
    new TransactionHistoryTool(agent),

    // Token tools
    new TokenInfoTool(agent),
    new TokenApprovalTool(agent),
    new TokenAllowanceTool(agent),

    // DexScreener tools
    new GetTokenDataTool(),
    new SearchTokenByTickerTool(),
  ];
}

// Re-export all tools for convenience
export * from "./dexscreener";
export * from "./wallet";
export * from "./token";

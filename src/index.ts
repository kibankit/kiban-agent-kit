// Core functionality
export * from "./agent/KibanAgentKit";
export * from "./types";

// Re-export tools with namespaces to avoid conflicts
import * as walletTools from "./tools/wallet";
import * as tokenTools from "./tools/token";
import * as dexScreenerTools from "./tools/dexscreener";

export { walletTools, tokenTools, dexScreenerTools };

// LangChain integration (optional)
export * as langchain from "./langchain";

# Tool Integration Guide

This guide explains how to create and integrate new tools into the Kiban Agent Kit. Tools are the building blocks that give the agent its capabilities.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Services](#core-services)
3. [LangChain Tools](#langchain-tools)
4. [Integration Process](#integration-process)
5. [Best Practices](#best-practices)
6. [Examples](#examples)

## Architecture Overview

Kiban Agent Kit follows a layered architecture:

1. **Core Services**: Blockchain interaction services that don't depend on LangChain
2. **Agent Class**: The main `KibanAgentKit` class that exposes core functionality
3. **LangChain Tools**: Structured tools that wrap core services for AI agent use

This separation allows developers to:
- Use core blockchain functionality without LangChain dependencies
- Create AI agents with LangChain integration
- Extend the toolkit with new capabilities at any layer

## Core Services

Core services handle direct blockchain interactions and are located in the `src/tools/` directory. Each service should:

1. Be focused on a specific domain (e.g., wallet, token, market data)
2. Not depend on LangChain or other AI libraries
3. Return structured data rather than strings
4. Handle errors gracefully

### Creating a New Core Service

1. Create a new directory in `src/tools/` for your domain
2. Create a `service.ts` file with your service class
3. Define interfaces for input parameters and return types
4. Implement methods for blockchain interactions
5. Export the service from an `index.ts` file

Example of a core service:

```typescript
// src/tools/myprotocol/service.ts
import { KibanAgentKit } from "../../agent/KibanAgentKit";

export interface ProtocolData {
  name: string;
  tvl: string;
  apy: string;
}

export class MyProtocolService {
  constructor(private agent: KibanAgentKit) {}

  async getProtocolData(protocolId: string): Promise<ProtocolData> {
    // Implementation
    return {
      name: "Protocol Name",
      tvl: "$1,000,000",
      apy: "5.2%"
    };
  }
}
```

### Exposing Core Service in the Agent

After creating a core service, expose it in the `KibanAgentKit` class:

```typescript
// src/agent/KibanAgentKit.ts
import { MyProtocolService } from "../tools/myprotocol/service";

export class KibanAgentKit {
  private myProtocolService: MyProtocolService;
  
  constructor(config: WalletConfig) {
    // Existing initialization
    
    // Initialize your service
    this.myProtocolService = new MyProtocolService(this);
  }
  
  // Expose service methods
  async getProtocolData(protocolId: string) {
    return this.myProtocolService.getProtocolData(protocolId);
  }
}
```

## LangChain Tools

LangChain tools wrap core services for use with AI agents. They are located in the `src/langchain/` directory and follow the LangChain `StructuredTool` pattern.

Each LangChain tool should:
1. Have a unique name in snake_case
2. Provide a clear description for the AI
3. Define an input schema using Zod
4. Return results as strings (usually JSON)

### Creating a New LangChain Tool

1. Create a new file in `src/langchain/` for your domain
2. Define your tool class extending `StructuredTool`
3. Implement the required properties and methods
4. Use the core service for blockchain interactions

Example of a LangChain tool:

```typescript
// src/langchain/myprotocol.ts
import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { KibanAgentKit } from "../agent/KibanAgentKit";

export class ProtocolDataTool extends StructuredTool {
  name = "get_protocol_data";
  description = "Get information about a DeFi protocol including TVL and APY";
  schema = z.object({
    protocolId: z.string().describe("The protocol identifier"),
  });

  constructor(private agent: KibanAgentKit) {
    super();
  }

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    try {
      const data = await this.agent.getProtocolData(input.protocolId);
      return JSON.stringify(data, null, 2);
    } catch (error: any) {
      return `Error getting protocol data: ${error.message}`;
    }
  }
}
```

## Integration Process

To fully integrate a new tool:

1. Create the core service in `src/tools/`
2. Expose the service methods in `KibanAgentKit`
3. Create LangChain tools in `src/langchain/`
4. Add the tools to `createKibanTools` in `src/langchain/index.ts`:

```typescript
import { ProtocolDataTool } from "./myprotocol";

export function createKibanTools(agent: KibanAgentKit): Array<StructuredTool> {
  return [
    // ... existing tools ...
    new ProtocolDataTool(agent),
  ];
}

// Re-export the tool
export * from "./myprotocol";
```

5. Update the agent prompt in `test/agent.test.ts` to include the new capability:
```typescript
const AGENT_PROMPT = `
// ... existing prompt ...
Available actions:
// ... existing actions ...
5. Get information about DeFi protocols including TVL and APY
`;
```

6. Update documentation in `docs/agent-actions.md`

## Best Practices

1. **Separation of Concerns**
   - Keep core blockchain logic separate from LangChain integration
   - Use interfaces to define clear contracts between layers
   - Handle errors at the appropriate level

2. **Naming Conventions**
   - Use PascalCase for service and tool classes
   - Use snake_case for LangChain tool names
   - Use camelCase for methods and properties

3. **Input Validation**
   - Validate inputs at both service and tool levels
   - Use Zod schemas for LangChain tools
   - Provide clear error messages

4. **Error Handling**
   - Catch and handle expected errors gracefully
   - Return structured errors from services
   - Convert errors to strings in LangChain tools

5. **Testing**
   - Add unit tests for services in `test/tools/`
   - Add integration tests for LangChain tools
   - Test both success and error cases

## Examples

Here are some examples from the Kiban Agent Kit:

### Core Service Example
```typescript
// src/tools/dexscreener/service.ts
export class DexScreenerService {
  async getTokenData(tokenAddress: string): Promise<TokenData | null> {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/tokens/${tokenAddress}`
      );

      if (!response.data.pairs || response.data.pairs.length === 0) {
        return null;
      }

      const pair = response.data.pairs[0];
      return {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        address: pair.baseToken.address as `0x${string}`,
        priceUsd: pair.priceUsd || "N/A",
        volume24h: pair.volume.h24 || "N/A",
        liquidity: pair.liquidity.usd || "N/A",
        pairAddress: pair.pairAddress,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch token data: ${(error as Error).message}`
      );
    }
  }
}
```

### LangChain Tool Example
```typescript
// src/langchain/dexscreener.ts
export class GetTokenDataTool extends StructuredTool {
  name = "get_token_data";
  description = "Get token price and market data from DexScreener";
  schema = z.object({
    tokenAddress: z.string().describe("The token contract address"),
  });

  private service: DexScreenerService;

  constructor() {
    super();
    this.service = new DexScreenerService();
  }

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    try {
      const tokenData = await this.service.getTokenData(input.tokenAddress);

      if (!tokenData) {
        return "No data found for this token";
      }

      return JSON.stringify(
        {
          name: tokenData.name,
          symbol: tokenData.symbol,
          address: tokenData.address,
          price_usd: tokenData.priceUsd,
          volume_24h: tokenData.volume24h,
          liquidity: tokenData.liquidity,
          pair_address: tokenData.pairAddress,
        },
        null,
        2
      );
    } catch (error: any) {
      return `Error fetching token data: ${error.message}`;
    }
  }
}
```

## Contributing New Tools

When contributing new tools:

1. Follow the architecture and naming conventions
2. Implement both core service and LangChain tools
3. Add comprehensive documentation
4. Include unit tests
5. Update the agent prompt
6. Submit a pull request

For more information on contributing, see our [contribution guidelines](../CONTRIBUTING.md). 

## Swap Tools Example

Here's an example of the swap functionality implementation:

### Core Service Example (Swap)
```typescript
// src/tools/token/swap.ts
export class SwapService {
  constructor(private agent: KibanAgentKit) {}

  /**
   * Get a quote for swapping tokens
   */
  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    const { tokenIn, tokenOut, amount, slippagePercentage = 0.5 } = params;

    // Normalize token addresses
    const normalizedTokenIn = this.normalizeTokenAddress(tokenIn);
    const normalizedTokenOut = this.normalizeTokenAddress(tokenOut);

    // Check if we're dealing with ETH
    const isETHIn = normalizedTokenIn === COMMON_TOKENS.ETH;
    const isETHOut = normalizedTokenOut === COMMON_TOKENS.ETH;

    // Get token metadata - use WETH for ETH
    const tokenInInfo = await this.agent.getTokenInfo(
      isETHIn ? COMMON_TOKENS.WETH : normalizedTokenIn
    );
    const tokenOutInfo = await this.agent.getTokenInfo(
      isETHOut ? COMMON_TOKENS.WETH : normalizedTokenOut
    );

    // Get quote from Uniswap V3 Quoter
    // ... implementation details ...

    return {
      tokenIn: {
        address: normalizedTokenIn,
        symbol: tokenInInfo.symbol,
        decimals: tokenInInfo.decimals,
        amount: formattedAmountIn,
      },
      tokenOut: {
        address: normalizedTokenOut,
        symbol: tokenOutInfo.symbol,
        decimals: tokenOutInfo.decimals,
        amount: formattedAmountOut,
      },
      executionPrice: `1 ${tokenInInfo.symbol} = ${formattedExecutionPrice} ${tokenOutInfo.symbol}`,
      minimumAmountOut: formattedMinimumAmountOut,
      priceImpact,
    };
  }

  /**
   * Execute a token swap
   */
  async swapTokens(params: SwapParams): Promise<SwapResult> {
    // ... implementation details ...
  }
}
```

### LangChain Tool Example (Swap)
```typescript
// src/langchain/swap.ts
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

  // ... implementation details ...
} 
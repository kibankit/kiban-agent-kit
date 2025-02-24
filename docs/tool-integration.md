# Tool Integration Guide

This guide explains how to create and integrate new tools into the Kiban Agent Kit. Tools are the building blocks that give the agent its capabilities.

## Table of Contents

1. [Tool Structure](#tool-structure)
2. [Creating a New Tool](#creating-a-new-tool)
3. [Tool Integration Process](#tool-integration-process)
4. [Best Practices](#best-practices)
5. [Examples](#examples)

## Tool Structure

Tools in the Kiban Agent Kit are built on top of LangChain's `StructuredTool` class. Each tool must define:

1. A unique name
2. A clear description
3. An input schema using Zod
4. An implementation of the `_call` method

Basic tool structure:

```typescript
import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export class MyCustomTool extends StructuredTool {
  name = "my_custom_tool";
  description = "Clear description of what the tool does";
  schema = z.object({
    param1: z.string().describe("Description of param1"),
    param2: z.number().describe("Description of param2"),
  });

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    // Implementation goes here
    return "Result as string";
  }
}
```

## Creating a New Tool

1. Create a new file in the appropriate directory under `src/tools/`
2. Define your tool class extending `StructuredTool`
3. Implement the required properties and methods
4. Export your tool

Example creating a price alert tool:

```typescript
// src/tools/market/price_alert.ts
import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export class PriceAlertTool extends StructuredTool {
  name = "set_price_alert";
  description = "Set a price alert for a token";
  schema = z.object({
    tokenAddress: z.string().describe("The token address to monitor"),
    targetPrice: z.number().describe("Target price to trigger alert"),
    condition: z.enum(["above", "below"]).describe("Alert when price goes above or below target"),
  });

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    // Implementation
    return `Price alert set for ${input.tokenAddress} at ${input.targetPrice}`;
  }
}
```

## Tool Integration Process

Tools are automatically integrated when added to the `createKibanTools` function in `src/langchain/index.ts`. The process is:

1. Import your tool:
```typescript
import { MyCustomTool } from "../tools/my_custom_tool";
```

2. Add it to the return array in `createKibanTools`:
```typescript
export function createKibanTools(agent: KibanAgentKit): Array<StructuredTool> {
  return [
    // ... existing tools ...
    new MyCustomTool(),
  ];
}
```

3. Update the agent prompt in `test/agent.test.ts` to include the new capability:
```typescript
const AGENT_PROMPT = `
// ... existing prompt ...
Available actions:
// ... existing actions ...
5. Your new tool description
`;
```

## Best Practices

1. **Naming Conventions**
   - Use snake_case for tool names
   - Use descriptive names that indicate the action
   - Avoid generic names that might conflict

2. **Description Guidelines**
   - Be specific about what the tool does
   - Include example inputs if helpful
   - Mention any limitations or requirements

3. **Input Validation**
   - Use Zod schemas to validate all inputs
   - Add descriptive messages for validation errors
   - Consider adding custom validation rules

4. **Error Handling**
   - Always return meaningful error messages
   - Catch and handle expected errors gracefully
   - Return errors in a consistent format

5. **Testing**
   - Add unit tests for your tool in `test/tools/`
   - Test both success and error cases
   - Mock external dependencies

## Examples

Here are some examples of tools in the Kiban Agent Kit:

### Market Data Tool
```typescript
// src/tools/dexscreener/get_token_data.ts
export class GetTokenDataTool extends StructuredTool {
  name = "get_token_data";
  description = "Get token price and market data from DexScreener";
  schema = z.object({
    tokenAddress: z.string().describe("The token contract address"),
  });

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    try {
      // Implementation
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
}
```

### Token Transfer Tool
```typescript
// src/tools/token/transfer.ts
export class TokenTransferTool extends StructuredTool {
  name = "transfer_tokens";
  description = "Transfer tokens to another address";
  schema = z.object({
    to: z.string().describe("Recipient address"),
    amount: z.string().describe("Amount to transfer"),
    tokenAddress: z.string().optional().describe("Optional token address (ETH if not provided)"),
  });

  constructor(private agent: KibanAgentKit) {
    super();
  }

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    try {
      // Implementation
      return `Transfer successful: ${txHash}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
}
```

## Contributing New Tools

When contributing new tools:

1. Follow the structure and naming conventions
2. Add comprehensive documentation
3. Include unit tests
4. Update the agent prompt
5. Submit a pull request

For more information on contributing, see our [contribution guidelines](../CONTRIBUTING.md). 
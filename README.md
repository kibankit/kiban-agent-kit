<div align="center">

# Kiban Agent Kit

![Kiban Agent Kit Banner](assets/banner.png)

![GitHub License](https://img.shields.io/github/license/kibankit/kiban-agent-kit?style=for-the-badge)
![GitHub Stars](https://img.shields.io/github/stars/kibankit/kiban-agent-kit?style=for-the-badge)
![NPM Downloads](https://img.shields.io/npm/dm/kiban-agent-kit?style=for-the-badge)

An open-source framework connecting defi AI agents to Katana ecosystem protocols.

</div>

## Features

### Core Wallet Operations
- Wallet address management
- Chain information and network state
- Native token (ETH) balance tracking
- Transaction history tracking
- Gas price estimation
- Multi-chain support foundation

### Token Operations
- ERC20 token interactions
  - Token metadata retrieval
  - Balance checking
  - Token transfers
  - Allowance management
- Transaction handling and receipt tracking

### Market Data Integration
- DexScreener integration
  - Token price lookup by address
  - Token search by ticker symbol
  - Market data (volume, liquidity)
  - Trading pair analysis

### AI Agent Integration
- LangChain structured tools
- Seamless integration with LLM agents
- Comprehensive agent prompt templates
- Interactive and autonomous modes

## Installation

```bash
npm install kiban-agent-kit
# or
yarn add kiban-agent-kit
# or
pnpm add kiban-agent-kit
```

## Quick Start

```typescript
import { KibanAgentKit } from 'kiban-agent-kit';
import { mainnet } from 'viem/chains';
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// Initialize the agent
const agent = new KibanAgentKit({
  privateKey: process.env.WALLET_PRIVATE_KEY as `0x${string}`,
  rpcUrl: process.env.MAINNET_RPC_URL,
  chain: mainnet
});

// Create AI agent with tools
const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4-turbo-preview",
  temperature: 0.3,
});

const aiAgent = await createReactAgent({
  llm,
  tools: createKibanTools(agent),
  messageModifier: AGENT_PROMPT,
});

// Start interactive mode
await runChatMode(aiAgent);
```

## Usage Examples

### Core Wallet Operations

```typescript
// Get wallet information
const walletInfo = await agent.getWalletInfo();
console.log("Wallet Info:", walletInfo);

// Get transaction history
const history = await agent.getTransactionHistory();
console.log("Transaction History:", history);

// Estimate gas for a transaction
const gasEstimate = await agent.estimateGasForTransaction(
  "0x1234...", // recipient address
  "0.1" // amount in ETH
);
console.log("Gas Estimate:", gasEstimate);
```

### Token Operations

```typescript
// Check token information
const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const tokenInfo = await agent.getTokenInfo(usdc);
console.log("Token Info:", {
  name: tokenInfo.name,
  symbol: tokenInfo.symbol,
  decimals: tokenInfo.decimals,
  balance: tokenInfo.balance
});

// Send tokens
const ethTxHash = await agent.sendTokens({
  token: "eth",
  to: "0x...",
  amount: "0.1"
});

// Approve token spending
const approvalTx = await agent.approveTokenSpending({
  token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  spender: "0x...", // e.g., Uniswap Router
  amount: "100"
});
```

### Market Data Operations

```typescript
// Get token data by address
const tokenData = await agent.getTokenData("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
console.log("USDC Market Data:", {
  price: tokenData.priceUsd,
  volume24h: tokenData.volume24h,
  liquidity: tokenData.liquidity
});

// Search token by ticker
const ethData = await agent.searchTokenByTicker("ETH");
console.log("ETH Trading Pairs:", ethData.results);
```

## Environment Setup

Create a `.env` file in your project root:

```env
# Required for blockchain interactions
WALLET_PRIVATE_KEY=0x...     # Your wallet's private key
MAINNET_RPC_URL=...         # Ethereum RPC URL (e.g., from Alchemy/Infura)

# Required for AI agent
OPENAI_API_KEY=...          # Your OpenAI API key

# Optional configurations
SUBMIT_TRANSACTIONS=false   # Safety flag for testing
```

## Testing the Agent

The agent can be tested in two modes:

```bash
# Run the test suite
pnpm test

# Test the AI agent interactively
pnpm test:agent
```

### Chat Mode
Interactive mode for testing agent capabilities:
```typescript
"What's the current price of USDC?"
"Show me the top trading pairs for WETH"
"Check my ETH balance"
"Transfer 0.1 ETH to 0x..."
```

### Autonomous Mode
Automated testing of agent capabilities:
```typescript
await runAutonomousMode(agent, 10); // Run with 10-second intervals
```

## Project Structure

```
kiban-agent-kit/
├── src/
│   ├── agent/              # Core agent implementation
│   ├── tools/              # Core blockchain tools
│   │   ├── wallet/         # Wallet operations
│   │   ├── token/          # Token operations
│   │   └── dexscreener/    # Market data tools
│   ├── langchain/          # LangChain integration
│   │   ├── wallet.ts       # Wallet LangChain tools
│   │   ├── token.ts        # Token LangChain tools
│   │   └── dexscreener.ts  # Market data LangChain tools
│   ├── types/              # TypeScript types
│   └── constants/          # Chain configs
├── test/
│   ├── tools/              # Tool unit tests
│   └── examples/           # Usage examples
└── docs/
    ├── agent-actions.md    # Available actions
    ├── tool-integration.md # Tool development guide
    └── examples.md         # Usage tutorials
```

## Dependencies

- @langchain/core: ^0.1.27
- @langchain/langgraph: ^0.0.8
- @langchain/openai: ^0.0.14
- viem: ^2.7.9
- TypeScript: ^5.3.3
- Node.js >=22.0.0

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Add tests for new functionality
5. Submit a pull request

See our [contribution guidelines](CONTRIBUTING.md) for more details.

## License

MIT

## Security

This toolkit handles private keys and transactions. Always:
- Use secure environment variables
- Never commit private keys
- Test with small amounts first
- Enable safety flags during testing

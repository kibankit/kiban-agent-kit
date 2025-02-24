<div align="center">

![Kiban Agent Kit Banner](assets/banner.png)

# Kiban Agent Kit

an open-source framework connecting defi AI agents to Katana ecosystem protocols

![GitHub License](https://img.shields.io/github/license/kibankit/kiban-agent-kit?style=for-the-badge)
![GitHub Stars](https://img.shields.io/github/stars/kibankit/kiban-agent-kit?style=for-the-badge)
![NPM Downloads](https://img.shields.io/npm/dm/kiban-agent-kit?style=for-the-badge)

</div>

## Features

### Core Wallet Operations
- Wallet address management
- Chain information and network state
- Native token (ETH) balance tracking
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

// Initialize the agent
const agent = new KibanAgentKit({
  privateKey: process.env.WALLET_PRIVATE_KEY as `0x${string}`,
  rpcUrl: process.env.MAINNET_RPC_URL,
  chain: mainnet
});

// Get wallet information
const address = agent.getAddress();
const balance = await agent.getNativeBalance();
console.log(`Wallet ${address} has ${balance} ETH`);
```

## Usage Examples

### Check Token Information

```typescript
// Check USDC token info and balance
const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const tokenInfo = await agent.checkToken(usdc);
console.log("Token Info:", {
  name: tokenInfo.name,
  symbol: tokenInfo.symbol,
  decimals: tokenInfo.decimals,
  balance: tokenInfo.balance
});
```

### Send Tokens

```typescript
// Send ETH
const ethTxHash = await agent.sendTokens({
  token: "eth",
  to: "0x...",
  amount: "0.1"
});

// Send ERC20
const tokenTxHash = await agent.sendTokens({
  token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  to: "0x...",
  amount: "100"
});
```

### Get Market Data

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
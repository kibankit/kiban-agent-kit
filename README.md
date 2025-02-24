# Kiban Agent Kit

an open-source framework connecting defi AI agents to Katana ecosystem protocols


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
- Support for both ETH and ERC20 transfers

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

### Manage Token Approvals

```typescript
// Approve USDC spending for Uniswap V3
const approveTxHash = await agent.approveSpending({
  token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  spender: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  amount: "1000"
});

// Check allowance
const allowance = await agent.getAllowance({
  token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  owner: agent.getAddress(),
  spender: "0xE592427A0AEce92De3Edee1F18E0157C05861564"
});
```

### Wait for Transactions

```typescript
const tx = await agent.sendTokens({ /* ... */ });
const result = await agent.waitForTransaction(tx);
console.log("Transaction status:", result.status);
```

## Environment Setup

Create a `.env` file in your project root:

```env
# Required
WALLET_PRIVATE_KEY=0x...     # Your wallet's private key
MAINNET_RPC_URL=...         # Ethereum RPC URL (e.g., from Alchemy/Infura)

# Optional
SUBMIT_TRANSACTIONS=false   # Safety flag for testing
KATANA_RPC_URL=...         # Future Katana L2 support
KATANA_CHAIN_ID=...        # Future Katana chain ID
```

## Project Structure

```
kiban-agent-kit/
├── src/
│   ├── agent/              # Core agent implementation
│   ├── tools/              # Modular functionality
│   │   ├── wallet/         # Wallet operations
│   │   └── token/          # Token operations
│   ├── types/              # TypeScript types
│   └── constants/          # Chain configs
├── test/
│   └── examples/           # Usage examples
└── docs/
    └── agent-actions.md    # API documentation
```

## Dependencies

- viem: Modern EVM interactions
- TypeScript: Type safety and developer experience
- Node.js >=22.0.0

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create `.env` file with required variables
4. Run tests:
   ```bash
   pnpm test
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Security

This toolkit handles private keys and transactions. Always ensure you're using it in a secure environment and never share your private keys.

## Roadmap

1. Market Data Integration
   - DexScreener integration
   - Price feeds
   - Market analysis tools

2. DEX Integration
   - Uniswap V3 support
   - Swap functionality
   - Liquidity operations

3. Advanced Features
   - Contract deployment
   - Event listening
   - Gas optimization
   - Transaction simulation

4. Katana L2 Support
   - Chain configuration
   - Protocol integrations
   - Bridge support

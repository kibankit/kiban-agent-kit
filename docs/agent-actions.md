# Kiban Agent Kit - Supported Actions

This document catalogs all the supported actions in the Kiban Agent Kit. Each action is designed to be simple, intuitive, and complete end-to-end operations.

## Wallet Operations

### Get Wallet Address
- **Method**: `getAddress()`
- **Description**: Get the wallet's public address
- **Returns**: Ethereum address as string
- **Example**:
```typescript
const address = agent.getAddress();
console.log("Wallet Address:", address);
```

### Get Chain ID
- **Method**: `getChainId()`
- **Description**: Get the current chain ID
- **Returns**: Chain ID as number
- **Example**:
```typescript
const chainId = agent.getChainId();
console.log("Chain ID:", chainId);
```

### Get Chain Info
- **Method**: `getChainInfo()`
- **Description**: Get information about the connected chain
- **Returns**: Chain information including name, ID, and native currency details
- **Example**:
```typescript
const chainInfo = await agent.getChainInfo();
console.log("Chain:", chainInfo);
```

### Get Native Balance
- **Method**: `getNativeBalance()`
- **Description**: Get the wallet's native token (ETH) balance
- **Returns**: Balance in ETH as string
- **Example**:
```typescript
const balance = await agent.getNativeBalance();
console.log("ETH Balance:", balance);
```

## Token Operations

### Check Token
- **Method**: `checkToken(tokenAddressOrSymbol: string)`
- **Description**: Get comprehensive information about a token including balance
- **Parameters**:
  - `tokenAddressOrSymbol`: Token address (symbol lookup coming soon)
- **Returns**: Token information including name, symbol, decimals, and balance
- **Example**:
```typescript
const usdc = await agent.checkToken("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
console.log("USDC Info:", usdc);
```

### Get Token Metadata
- **Method**: `getTokenMetadata(tokenAddress: string)`
- **Description**: Get token metadata including total supply
- **Parameters**:
  - `tokenAddress`: Token contract address
- **Returns**: Token metadata including name, symbol, decimals, and total supply
- **Example**:
```typescript
const metadata = await agent.getTokenMetadata("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
console.log("Token Metadata:", metadata);
```

### Send Tokens
- **Method**: `sendTokens(params: SendTokenParams)`
- **Description**: Send either native token (ETH) or any ERC20 token
- **Parameters**:
  - `token`: "eth" or token address
  - `to`: Recipient address
  - `amount`: Amount in human-readable format (e.g., "1.5")
  - `options`: Optional parameters (e.g., slippage tolerance)
- **Returns**: Transaction hash
- **Example**:
```typescript
// Send ETH
const ethTx = await agent.sendTokens({
  token: "eth",
  to: "0x...",
  amount: "0.1"
});

// Send USDC
const usdcTx = await agent.sendTokens({
  token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  to: "0x...",
  amount: "100"
});
```

### Approve Token Spending
- **Method**: `approveSpending(params: ApproveParams)`
- **Description**: Approve a spender (e.g., DEX) to spend tokens
- **Parameters**:
  - `token`: Token address
  - `spender`: Spender address
  - `amount`: Amount in human-readable format
- **Returns**: Transaction hash
- **Example**:
```typescript
const tx = await agent.approveSpending({
  token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  spender: "0x...", // e.g., Uniswap Router
  amount: "1000"
});
```

### Get Token Allowance
- **Method**: `getAllowance(params: AllowanceParams)`
- **Description**: Get the amount of tokens approved for a spender
- **Parameters**:
  - `token`: Token address
  - `owner`: Token owner address
  - `spender`: Spender address
- **Returns**: Allowance amount as bigint
- **Example**:
```typescript
const allowance = await agent.getAllowance({
  token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  owner: agent.getAddress(),
  spender: "0x..." // e.g., Uniswap Router
});
```

### Wait for Transaction
- **Method**: `waitForTransaction(hash: Hash)`
- **Description**: Wait for a transaction to be mined and get its receipt
- **Parameters**:
  - `hash`: Transaction hash
- **Returns**: Transaction result with wait function for receipt
- **Example**:
```typescript
const tx = await agent.sendTokens({ ... });
const result = await agent.waitForTransaction(tx);
const receipt = await result.wait();
console.log("Transaction status:", receipt.status);
```

## Market Analysis

### Get Token Market Data
- **Method**: `getTokenMarket(tokenAddressOrSymbol: string)`
- **Description**: Get comprehensive market data for a token
- **Parameters**:
  - `tokenAddressOrSymbol`: Token address or symbol
- **Returns**: Price, volume, liquidity, and other market metrics
- **Example**:
```typescript
const market = await agent.getTokenMarket("ETH");
console.log("Price:", market.priceUsd);
console.log("24h Volume:", market.volume24h);
```

### Find Best Token Price
- **Method**: `findBestPrice(params: PriceParams)`
- **Description**: Find the best price for a token across multiple sources
- **Parameters**:
  - `token`: Token address or symbol
  - `amount`: Amount to check
  - `side`: "buy" or "sell"
- **Returns**: Best price and source
- **Example**:
```typescript
const best = await agent.findBestPrice({
  token: "USDC",
  amount: "1000",
  side: "buy"
});
console.log("Best price:", best.price);
console.log("From source:", best.source);
```

## Portfolio Management

### Get Portfolio Overview
- **Method**: `getPortfolio()`
- **Description**: Get a complete overview of the wallet's portfolio
- **Returns**: List of all token holdings with balances and current values
- **Example**:
```typescript
const portfolio = await agent.getPortfolio();
console.log("Total Value:", portfolio.totalValueUsd);
console.log("Holdings:", portfolio.tokens);
```

### Track Token
- **Method**: `trackToken(tokenAddressOrSymbol: string)`
- **Description**: Add a token to the tracked portfolio
- **Parameters**:
  - `tokenAddressOrSymbol`: Token address or symbol to track
- **Example**:
```typescript
await agent.trackToken("USDC");
```

## Coming Soon
- Token symbol resolution (lookup by symbol)
- Market data integration
- DEX integration
- Price feeds
- Contract deployment
- Event listening 
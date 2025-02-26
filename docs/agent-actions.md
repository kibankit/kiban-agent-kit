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

### Get Wallet Info
- **Method**: `getWalletInfo()`
- **Description**: Get comprehensive information about the connected wallet
- **Returns**: Wallet information including address, balance, chain details, and a human-readable message
- **Example**:
```typescript
const info = await agent.getWalletInfo();
console.log("Wallet Info:", info);
```

### Get Transaction History
- **Method**: `getTransactionHistory(limit?: number)`
- **Description**: Get transaction history for the connected wallet
- **Parameters**:
  - `limit`: Optional maximum number of transactions to return (default: 5)
- **Returns**: Transaction history including count and Etherscan link
- **Example**:
```typescript
const history = await agent.getTransactionHistory(10);
console.log("Transaction History:", history);
```

### Estimate Gas
- **Method**: `estimateGas(params: { to: string; value: bigint })`
- **Description**: Estimate gas units required for a transaction
- **Parameters**:
  - `params.to`: Recipient address
  - `params.value`: Amount in wei
- **Returns**: Estimated gas units as bigint
- **Example**:
```typescript
const gas = await agent.estimateGas({
  to: "0x...",
  value: BigInt("1000000000000000000") // 1 ETH
});
console.log("Gas Units:", gas.toString());
```

### Estimate Gas For Transaction
- **Method**: `estimateGasForTransaction(to?: string, value?: string)`
- **Description**: Get current gas prices and estimate transaction costs
- **Parameters**:
  - `to`: Optional recipient address
  - `value`: Optional amount in ETH
- **Returns**: Gas estimate including current gas price and estimated cost
- **Example**:
```typescript
const estimate = await agent.estimateGasForTransaction(
  "0x...",
  "0.1"
);
console.log("Gas Price:", estimate.currentGasPrice);
console.log("Estimated Cost:", estimate.transactionDetails?.estimatedCostEth);
```

### Get Gas Price
- **Method**: `getGasPrice()`
- **Description**: Get the current gas price
- **Returns**: Gas price in wei as bigint
- **Example**:
```typescript
const gasPrice = await agent.getGasPrice();
console.log("Gas Price (wei):", gasPrice.toString());
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

### Get Token Info
- **Method**: `getTokenInfo(tokenAddress: string)`
- **Description**: Get information about a token including balance
- **Parameters**:
  - `tokenAddress`: Token contract address
- **Returns**: Token information including name, symbol, decimals, and balance
- **Example**:
```typescript
const info = await agent.getTokenInfo("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
console.log("Token Info:", info);
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

### Send Tokens With Service
- **Method**: `sendTokensWithService(params: SendTokenParams)`
- **Description**: Send tokens using the TokenService
- **Parameters**:
  - `token`: "eth" or token address
  - `to`: Recipient address
  - `amount`: Amount in human-readable format
- **Returns**: Transaction result with hash
- **Example**:
```typescript
const result = await agent.sendTokensWithService({
  token: "eth",
  to: "0x...",
  amount: "0.1"
});
console.log("Transaction Hash:", result.hash);
```

### Approve Spending
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

### Approve Token Spending
- **Method**: `approveTokenSpending(params: ApproveParams)`
- **Description**: Approve token spending using the TokenService
- **Parameters**:
  - `token`: Token address
  - `spender`: Spender address
  - `amount`: Amount in human-readable format
- **Returns**: Transaction result with hash
- **Example**:
```typescript
const result = await agent.approveTokenSpending({
  token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  spender: "0x...",
  amount: "1000"
});
console.log("Transaction Hash:", result.hash);
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

### Get Token Allowance (Service)
- **Method**: `getTokenAllowance(params: AllowanceParams)`
- **Description**: Get token allowance using the TokenService
- **Parameters**:
  - `token`: Token address
  - `owner`: Token owner address
  - `spender`: Spender address
- **Returns**: Allowance amount as bigint
- **Example**:
```typescript
const allowance = await agent.getTokenAllowance({
  token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  owner: agent.getAddress(),
  spender: "0x..."
});
console.log("Allowance:", allowance.toString());
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

## Market Data Operations

### Get Token Data
- **Method**: `getTokenData(tokenAddress: string)`
- **Description**: Get token price and market data from DexScreener
- **Parameters**:
  - `tokenAddress`: Token contract address
- **Returns**: Token data including price, volume, and liquidity
- **Example**:
```typescript
const data = await agent.getTokenData("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
console.log("Token Data:", data);
```

### Search Token By Ticker
- **Method**: `searchTokenByTicker(ticker: string)`
- **Description**: Search for tokens by ticker symbol
- **Parameters**:
  - `ticker`: Token ticker symbol (e.g., "ETH", "USDC")
- **Returns**: Search results with matching tokens
- **Example**:
```typescript
const results = await agent.searchTokenByTicker("ETH");
console.log("Search Results:", results);
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
- Token symbol resolution (lookup by token symbol)
- Portfolio management
- DEX integration
- Price feeds
- Contract deployment
- Event listening 
import { KibanAgentKit } from "../../src/agent/KibanAgentKit";
import { mainnet } from "viem/chains";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configuration
const MAINNET_CONFIG = {
  chain: mainnet,
  rpcUrl: process.env.MAINNET_RPC_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY as `0x${string}`,
};

// Popular mainnet token addresses
const TOKENS = {
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
};

// Test if transactions should be submitted
const SUBMIT_TRANSACTIONS = process.env.SUBMIT_TRANSACTIONS === "true";

async function main() {
  try {
    // Initialize agent
    console.log("🚀 Initializing Kiban Agent Kit on Ethereum mainnet...");
    const agent = new KibanAgentKit(MAINNET_CONFIG);

    // Test wallet tools
    console.log("\n🔑 Testing wallet tools...");
    const address = agent.getAddress();
    console.log(`Wallet address: ${address}`);

    const chainId = agent.getChainId();
    console.log(`Chain ID: ${chainId}`);

    const chainInfo = await agent.getChainInfo();
    console.log("Chain info:", chainInfo);

    const balance = await agent.getNativeBalance();
    console.log(`Native ETH balance: ${balance}`);

    // Test token tools - Read operations
    console.log("\n💰 Testing token tools - Read operations...");
    for (const [symbol, address] of Object.entries(TOKENS)) {
      console.log(`\nChecking ${symbol} token...`);
      const tokenInfo = await agent.checkToken(address);
      console.log(`- Name: ${tokenInfo.name}`);
      console.log(`- Symbol: ${tokenInfo.symbol}`);
      console.log(`- Decimals: ${tokenInfo.decimals}`);
      console.log(`- Balance: ${tokenInfo.balance}`);

      const metadata = await agent.getTokenMetadata(address);
      console.log(`- Total Supply: ${metadata.totalSupply}`);

      // Check allowance for Uniswap V3 Router
      const uniswapV3Router = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
      const allowance = await agent.getAllowance({
        token: address,
        owner: agent.getAddress(),
        spender: uniswapV3Router,
      });
      console.log(`- Uniswap V3 Router Allowance: ${allowance}`);
    }

    // Test token tools - Write operations (if enabled)
    if (SUBMIT_TRANSACTIONS) {
      console.log("\n📝 Testing token tools - Write operations...");

      // Test sending ETH
      console.log("\nSending 0.0001 ETH...");
      const ethTxHash = await agent.sendTokens({
        token: "eth",
        to: "0x0000000000000000000000000000000000000000",
        amount: "0.0001",
      });
      console.log(`Transaction hash: ${ethTxHash}`);

      const ethTxResult = await agent.waitForTransaction(ethTxHash);
      console.log("Transaction result:", await ethTxResult.wait());

      // Test approving USDC
      console.log("\nApproving USDC for Uniswap V3 Router...");
      const approveTxHash = await agent.approveSpending({
        token: TOKENS.USDC,
        spender: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        amount: "100",
      });
      console.log(`Transaction hash: ${approveTxHash}`);

      const approveTxResult = await agent.waitForTransaction(approveTxHash);
      console.log("Transaction result:", await approveTxResult.wait());
    } else {
      console.log(
        "\n⏭️ Skipping transaction tests (SUBMIT_TRANSACTIONS=false)"
      );
    }

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  if (!process.env.WALLET_PRIVATE_KEY) {
    throw new Error("WALLET_PRIVATE_KEY environment variable is required");
  }
  if (!process.env.MAINNET_RPC_URL) {
    throw new Error("MAINNET_RPC_URL environment variable is required");
  }
  main();
}

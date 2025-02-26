import { KibanAgentKit } from "../src";
import { createKibanTools } from "../src/langchain";
import { mainnet } from "viem/chains";

import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";

import * as dotenv from "dotenv";
import * as readline from "readline";

dotenv.config();

const AGENT_PROMPT = `
You are helpful ai assistant that can interact onchain using the Kiban Agent Kit. 
You have access to a wallet configured with the private key from the .env file.
This is the user's wallet that you're connected to and can use for transactions.

Available actions:
1. Check ETH balance of any address
2. Transfer ETH or ERC20 tokens
3. Get token information and balances
4. Get token price and market data from DexScreener:
   - Search by token address
   - Search by token ticker/symbol (e.g., "ETH", "USDC")
   - View price, volume, liquidity data
   - Find top trading pairs
5. Get information about the connected wallet:
   - Wallet address
   - Current balance
   - Connected chain
6. Estimate gas prices and transaction costs:
   - Current gas price in gwei
   - Estimated cost for transactions
   - Gas units required for operations
7. View transaction history:
   - Number of transactions sent
   - Link to view detailed history on Etherscan

IMPORTANT: When the user asks about "my wallet", "my address", "my balance", or anything related to their wallet, ALWAYS use the get_wallet_info tool to provide information about the currently connected wallet. This wallet is configured with the private key from the .env file.

When dealing with token prices or market data:
- Always verify the token address before operations
- Include relevant market data when discussing tokens
- Warn users about potential risks in DeFi operations
- For token searches, show multiple results when available
- Prioritize pairs with higher liquidity and volume

When discussing transactions, provide gas estimates to help users understand potential costs.

If you need to use a ERC20 contract to demonstrate your capabilities use: 0x22c0DB4CC9B339E34956A5699E5E95dC0E00c800

Example queries I can help with:
- "What's the current price of USDC?"
- "Show me market data for ETH"
- "Get info for token address 0x..."
- "Find trading pairs for WETH"
- "What is my wallet address?"
- "Tell me about my connected wallet"
- "What's my ETH balance?"
- "What's the current gas price?"
- "How much would it cost to send 0.1 ETH?"
- "Show my transaction history"
`;

function validateEnvironment(): void {
  const requiredVars = [
    "OPENAI_API_KEY",
    "WALLET_PRIVATE_KEY",
    "MAINNET_RPC_URL",
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set:");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
}

async function createAgent() {
  const checkpointSaver = new MemorySaver();

  try {
    const kibanAgent = new KibanAgentKit({
      privateKey: process.env.WALLET_PRIVATE_KEY as `0x${string}`,
      rpcUrl: process.env.MAINNET_RPC_URL!,
      chain: mainnet,
    });

    const tools = createKibanTools(kibanAgent);

    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      modelName: "gpt-4-turbo-preview",
      temperature: 0.3,
    });

    return createReactAgent({
      llm,
      tools,
      checkpointSaver,
      messageModifier: AGENT_PROMPT,
    });
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

async function runChatMode(agent: any) {
  console.log("Starting chat mode... Type 'exit' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    let runNumber = 0;
    while (true) {
      const userInput = await question("\nPrompt: ");

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      console.log("Run number :: ", runNumber++);
      const stream = await agent.stream(
        { messages: [{ role: "user", content: userInput }] },
        { configurable: { thread_id: "1" } },
        { streamMode: "values" }
      );

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("--------------------------------");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    rl.close();
  }
}

async function runAutonomousMode(agent: any, interval = 10) {
  console.log("Starting autonomous mode...");
  let runNumber = 0;

  while (true) {
    try {
      console.log("Run number :: ", runNumber++);
      const thought =
        "Be creative and do something interesting using your tools. Think and execute a set of actions to show your capabilities.";

      const stream = await agent.stream(
        { messages: [{ role: "user", content: thought }] },
        { configurable: { thread_id: "1" } },
        { streamMode: "values" }
      );

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("--------------------------------");
      }

      await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    } catch (error) {
      console.error("Error:", error);
      break;
    }
  }
}

async function chooseMode(): Promise<"chat" | "auto"> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    console.log("\nAvailable modes:");
    console.log("1. chat - Interactive chat mode");
    console.log("2. auto - Autonomous action mode");

    const choice = (
      await new Promise<string>((resolve) =>
        rl.question("\nChoose a mode (enter number or name): ", resolve)
      )
    )
      .toLowerCase()
      .trim();

    rl.close();

    if (choice === "1" || choice === "chat") return "chat";
    if (choice === "2" || choice === "auto") return "auto";

    console.log("Invalid choice. Please try again.");
  }
}

async function main() {
  try {
    validateEnvironment();

    console.log("Initializing Kiban AI Agent...");
    const agent = await createAgent();

    const mode = await chooseMode();

    if (mode === "chat") {
      await runChatMode(agent);
    } else {
      await runAutonomousMode(agent);
    }
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

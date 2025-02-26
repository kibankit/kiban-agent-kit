import { KibanAgentKit } from "../../agent/KibanAgentKit";
import { formatUnits, parseUnits, WriteContractParameters } from "viem";

// Uniswap V3 Router address
export const UNISWAP_V3_ROUTER =
  "0xE592427A0AEce92De3Edee1F18E0157C05861564" as const;
export const UNISWAP_V3_QUOTER =
  "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6" as const;

// Common token addresses
export const COMMON_TOKENS = {
  ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Special address to represent ETH
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
};

// Uniswap V3 Router ABI (minimal for swap functionality)
export const UNISWAP_V3_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "address", name: "tokenOut", type: "address" },
          { internalType: "uint24", name: "fee", type: "uint24" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
          {
            internalType: "uint256",
            name: "amountOutMinimum",
            type: "uint256",
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct ISwapRouter.ExactInputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// Uniswap V3 Quoter ABI (minimal for quote functionality)
export const UNISWAP_V3_QUOTER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "tokenIn", type: "address" },
      { internalType: "address", name: "tokenOut", type: "address" },
      { internalType: "uint24", name: "fee", type: "uint24" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint160", name: "sqrtPriceLimitX96", type: "uint160" },
    ],
    name: "quoteExactInputSingle",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  slippagePercentage?: number; // Default: 0.5%
  recipient?: string; // Default: sender's address
}

export interface SwapQuote {
  tokenIn: {
    address: string;
    symbol: string;
    decimals: number;
    amount: string;
  };
  tokenOut: {
    address: string;
    symbol: string;
    decimals: number;
    amount: string;
  };
  executionPrice: string;
  minimumAmountOut: string;
  priceImpact: string;
}

export interface SwapResult {
  hash: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  expectedAmountOut: string;
}

/**
 * Service for token swapping using Uniswap V3
 */
export class SwapService {
  private agent: KibanAgentKit;

  constructor(agent: KibanAgentKit) {
    this.agent = agent;
  }

  /**
   * Helper to normalize token addresses (handle ETH vs WETH)
   */
  private normalizeTokenAddress(token: string): string {
    // Handle common token symbols (case insensitive)
    const upperToken = token.toUpperCase();

    if (upperToken === "ETH") {
      return COMMON_TOKENS.ETH;
    }
    if (upperToken === "WETH") {
      return COMMON_TOKENS.WETH;
    }
    if (upperToken === "USDC") {
      return COMMON_TOKENS.USDC;
    }
    if (upperToken === "USDT") {
      return COMMON_TOKENS.USDT;
    }
    if (upperToken === "DAI") {
      return COMMON_TOKENS.DAI;
    }

    // Return the address as is
    return token;
  }

  /**
   * Get a quote for swapping tokens
   */
  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    const { tokenIn, tokenOut, amount, slippagePercentage = 0.5 } = params;

    console.log(`Getting quote for swap: ${amount} ${tokenIn} -> ${tokenOut}`);

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

    // Parse amount with proper decimals
    const amountIn = parseUnits(amount, tokenInInfo.decimals);

    // Use 0.3% fee pool as default
    const fee = 3000;

    try {
      // We need to use the internal method to access the protected clients property
      // This is a workaround for the protected access
      const publicClient = (this.agent as any).clients.public;

      const amountOutResult = await publicClient.readContract({
        address: UNISWAP_V3_QUOTER,
        abi: UNISWAP_V3_QUOTER_ABI,
        functionName: "quoteExactInputSingle",
        args: [
          isETHIn ? COMMON_TOKENS.WETH : normalizedTokenIn,
          isETHOut ? COMMON_TOKENS.WETH : normalizedTokenOut,
          BigInt(fee),
          amountIn,
          0n, // sqrtPriceLimitX96 (0 = no limit)
        ],
      });

      // Cast the result to bigint
      const amountOut = amountOutResult as bigint;

      // Calculate minimum amount out with slippage
      const minimumAmountOut =
        (amountOut * BigInt(10000 - Math.round(slippagePercentage * 100))) /
        10000n;

      // Format amounts for human readability
      const formattedAmountIn = formatUnits(amountIn, tokenInInfo.decimals);
      const formattedAmountOut = formatUnits(amountOut, tokenOutInfo.decimals);
      const formattedMinimumAmountOut = formatUnits(
        minimumAmountOut,
        tokenOutInfo.decimals
      );

      // Calculate execution price
      const executionPrice = Number(amountOut) / Number(amountIn);
      const formattedExecutionPrice = (
        executionPrice *
        10 ** (tokenInInfo.decimals - tokenOutInfo.decimals)
      ).toFixed(6);

      // Calculate price impact (simplified)
      const priceImpact = "< 1%"; // Placeholder

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
    } catch (error: any) {
      throw new Error(`Failed to get swap quote: ${error.message}`);
    }
  }

  /**
   * Execute a token swap
   */
  async swapTokens(params: SwapParams): Promise<SwapResult> {
    const {
      tokenIn,
      tokenOut,
      amount,
      slippagePercentage = 0.5,
      recipient,
    } = params;

    // Get quote first to calculate expected output
    const quote = await this.getSwapQuote(params);

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

    // Parse amount with proper decimals
    const amountIn = parseUnits(amount, tokenInInfo.decimals);

    // Calculate minimum amount out from quote
    const minimumAmountOut = parseUnits(
      quote.minimumAmountOut,
      quote.tokenOut.decimals
    );

    // Set up swap parameters
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes from now
    const recipientAddress = recipient || this.agent.getAddress();

    // Use 0.3% fee pool as default
    const fee = 3000;

    try {
      // If tokenIn is not ETH, we need to approve the router first
      if (!isETHIn) {
        // Check if we have enough allowance
        const allowance = await this.agent.getTokenAllowance({
          token: normalizedTokenIn,
          owner: this.agent.getAddress(),
          spender: UNISWAP_V3_ROUTER,
        });

        if (allowance < amountIn) {
          // Approve the router to spend our tokens
          await this.agent.approveTokenSpending({
            token: normalizedTokenIn,
            spender: UNISWAP_V3_ROUTER,
            amount: amount,
          });
        }
      }

      // Prepare the swap parameters
      const swapParams = {
        tokenIn: isETHIn ? COMMON_TOKENS.WETH : normalizedTokenIn,
        tokenOut: isETHOut ? COMMON_TOKENS.WETH : normalizedTokenOut,
        fee: BigInt(fee),
        recipient: isETHOut ? this.agent.getAddress() : recipientAddress,
        deadline,
        amountIn,
        amountOutMinimum: minimumAmountOut,
        sqrtPriceLimitX96: 0n, // 0 = no limit
      };

      // We need to use the internal method to access the protected clients property
      // This is a workaround for the protected access
      const walletClient = (this.agent as any).clients.wallet;
      const chain = (this.agent as any).chain;
      const account = (this.agent as any).account;

      // Execute the swap
      let txHash;

      if (isETHIn) {
        // For ETH -> Token swaps, we need to use the payable function and send ETH
        console.log(`Swapping ${amount} ETH to tokens`);

        txHash = await walletClient.writeContract({
          address: UNISWAP_V3_ROUTER,
          abi: UNISWAP_V3_ROUTER_ABI,
          functionName: "exactInputSingle",
          args: [swapParams],
          value: amountIn, // This is the ETH amount we're swapping
          chain,
          account,
        });
      } else {
        // For Token -> Token or Token -> ETH swaps
        txHash = await walletClient.writeContract({
          address: UNISWAP_V3_ROUTER,
          abi: UNISWAP_V3_ROUTER_ABI,
          functionName: "exactInputSingle",
          args: [swapParams],
          chain,
          account,
        });
      }

      // Wait for transaction to be mined
      await this.agent.waitForTransaction(txHash);

      return {
        hash: txHash,
        tokenIn: quote.tokenIn.symbol,
        tokenOut: quote.tokenOut.symbol,
        amountIn: quote.tokenIn.amount,
        expectedAmountOut: quote.tokenOut.amount,
      };
    } catch (error: any) {
      console.error("Swap error details:", error);

      if (error.message.includes("insufficient funds")) {
        // Get current balance for better error message
        const balance = await this.agent.getNativeBalance();
        throw new Error(
          `Insufficient funds for swap. You have ${balance} ETH but the transaction requires ${amount} ETH plus gas fees.`
        );
      }

      throw new Error(`Failed to execute swap: ${error.message}`);
    }
  }
}

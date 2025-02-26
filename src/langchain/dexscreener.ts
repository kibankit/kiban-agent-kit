import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { DexScreenerService } from "../tools/dexscreener";

/**
 * LangChain tool for getting token data from DexScreener
 */
export class GetTokenDataTool extends StructuredTool {
  name = "get_token_data";
  description =
    "Get token price and market data from DexScreener using a token address";
  schema = z.object({
    tokenAddress: z.string().describe("The token contract address to look up"),
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

/**
 * LangChain tool for searching tokens by ticker symbol
 */
export class SearchTokenByTickerTool extends StructuredTool {
  name = "search_token_by_ticker";
  description =
    "Search for a token on DexScreener using its ticker symbol (e.g., 'ETH', 'USDC')";
  schema = z.object({
    ticker: z.string().describe("The token ticker/symbol to search for"),
  });

  private service: DexScreenerService;

  constructor() {
    super();
    this.service = new DexScreenerService();
  }

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    try {
      const result = await this.service.searchTokenByTicker(input.ticker);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error searching for token: ${error.message}`;
    }
  }
}

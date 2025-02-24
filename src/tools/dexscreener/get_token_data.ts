import { StructuredTool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

interface TokenData {
  name: string;
  symbol: string;
  address: `0x${string}`;
  priceUsd: string;
  volume24h: string;
  liquidity: string;
  pairAddress: string;
}

const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex";

export class GetTokenDataTool extends StructuredTool {
  name = "get_token_data";
  description =
    "Get token price and market data from DexScreener using a token address";
  schema = z.object({
    tokenAddress: z.string().describe("The token contract address to look up"),
  });

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/tokens/${input.tokenAddress}`
      );

      if (!response.data.pairs || response.data.pairs.length === 0) {
        return "No data found for this token";
      }

      const pair = response.data.pairs[0];
      const tokenData: TokenData = {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        address: pair.baseToken.address as `0x${string}`,
        priceUsd: pair.priceUsd || "N/A",
        volume24h: pair.volume.h24 || "N/A",
        liquidity: pair.liquidity.usd || "N/A",
        pairAddress: pair.pairAddress,
      };

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

export class SearchTokenByTickerTool extends StructuredTool {
  name = "search_token_by_ticker";
  description =
    "Search for a token on DexScreener using its ticker symbol (e.g., 'ETH', 'USDC')";
  schema = z.object({
    ticker: z.string().describe("The token ticker/symbol to search for"),
  });

  protected async _call(input: z.input<typeof this.schema>): Promise<string> {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/search?q=${input.ticker}`
      );

      if (!response.data.pairs || response.data.pairs.length === 0) {
        return "No tokens found matching this ticker";
      }

      // Sort pairs by volume and get top 3
      const topPairs = response.data.pairs
        .sort((a: any, b: any) => Number(b.volume.h24) - Number(a.volume.h24))
        .slice(0, 3);

      const results = topPairs.map((pair: any) => ({
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        address: pair.baseToken.address,
        chain: pair.chainId,
        price_usd: pair.priceUsd || "N/A",
        volume_24h: pair.volume.h24 || "N/A",
        liquidity: pair.liquidity.usd || "N/A",
        dex: pair.dexId,
      }));

      return JSON.stringify(
        {
          message: `Found ${topPairs.length} top pairs for ${input.ticker}`,
          results,
        },
        null,
        2
      );
    } catch (error: any) {
      return `Error searching for token: ${error.message}`;
    }
  }
}

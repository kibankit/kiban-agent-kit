import axios from "axios";

export interface TokenData {
  name: string;
  symbol: string;
  address: `0x${string}`;
  priceUsd: string;
  volume24h: string;
  liquidity: string;
  pairAddress: string;
}

export interface TokenSearchResult {
  name: string;
  symbol: string;
  address: string;
  chain: string;
  price_usd: string;
  volume_24h: string;
  liquidity: string;
  dex: string;
}

export interface TokenSearchResponse {
  message: string;
  results: TokenSearchResult[];
}

const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex";

/**
 * Core DexScreener service for fetching token data
 */
export class DexScreenerService {
  /**
   * Get token price and market data from DexScreener using a token address
   */
  async getTokenData(tokenAddress: string): Promise<TokenData | null> {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/tokens/${tokenAddress}`
      );

      if (!response.data.pairs || response.data.pairs.length === 0) {
        return null;
      }

      const pair = response.data.pairs[0];
      return {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        address: pair.baseToken.address as `0x${string}`,
        priceUsd: pair.priceUsd || "N/A",
        volume24h: pair.volume.h24 || "N/A",
        liquidity: pair.liquidity.usd || "N/A",
        pairAddress: pair.pairAddress,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch token data: ${(error as Error).message}`
      );
    }
  }

  /**
   * Search for a token on DexScreener using its ticker symbol
   */
  async searchTokenByTicker(ticker: string): Promise<TokenSearchResponse> {
    try {
      const response = await axios.get(`${DEXSCREENER_API}/search?q=${ticker}`);

      if (!response.data.pairs || response.data.pairs.length === 0) {
        return {
          message: "No tokens found matching this ticker",
          results: [],
        };
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

      return {
        message: `Found ${topPairs.length} top pairs for ${ticker}`,
        results,
      };
    } catch (error) {
      throw new Error(
        `Failed to search for token: ${(error as Error).message}`
      );
    }
  }
}

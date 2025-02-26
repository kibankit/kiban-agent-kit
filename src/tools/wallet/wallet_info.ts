import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { KibanAgentKit } from "../../agent/KibanAgentKit";
import { formatEther } from "viem";

/**
 * Tool for getting information about the connected wallet
 */
export class WalletInfoTool extends StructuredTool {
  name = "get_wallet_info";
  description =
    "Get information about the currently connected wallet including address, balance, and chain";
  schema = z.object({});

  constructor(private agent: KibanAgentKit) {
    super();
  }

  protected async _call(): Promise<string> {
    try {
      const address = this.agent.getAddress();
      const balance = await this.agent.getNativeBalance();
      const chainInfo = await this.agent.getChainInfo();

      return JSON.stringify(
        {
          address,
          balance: `${balance} ETH`,
          chain: {
            name: chainInfo.name,
            id: chainInfo.id,
            nativeCurrency: chainInfo.nativeCurrency,
          },
          message: `This wallet (${address}) is connected to ${chainInfo.name} with a balance of ${balance} ETH.`,
        },
        null,
        2
      );
    } catch (error: any) {
      return `Error retrieving wallet information: ${error.message}`;
    }
  }
}

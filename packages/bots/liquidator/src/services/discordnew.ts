import { EncodedLiquidationTx, ErroredPool, LiquidatablePool } from "@ionicprotocol/sdk";
import { SupportedChains } from "@ionicprotocol/types";
import { MessageBuilder, Webhook } from "discord-webhook-node";
import { TransactionReceipt } from "viem";

import config from "../config";
export type SimplifiedTransactionReceipt = Pick<
  TransactionReceipt,
  "transactionHash" | "contractAddress" | "from" | "to" | "status"
>;

export class DiscordService {
  lastSentMessages: {
    erroredPools: { pools: Array<ErroredPool>; timestamp: number };
    liquidations: { tx: EncodedLiquidationTx[] | null; timestamp: number };
  };
  chainId: SupportedChains;
  private errorColor = 0xff0000;
  private warningColor = 0xfcdb03;
  private infoColor = 0x00ff00;
  private failureHook = new Webhook(config.DISCORD_FAILURE_WEBHOOK_URL);
  private successHook = new Webhook(config.DISCORD_SUCCESS_WEBHOOK_URL);

  constructor(chainId: SupportedChains) {
    this.chainId = chainId;
    this.lastSentMessages = {
      erroredPools: { pools: [], timestamp: 0 },
      liquidations: { tx: null, timestamp: 0 },
    };
  }

  private createBaseMessage(): MessageBuilder {
    return new MessageBuilder().addField("Chain", `Chain ID: ${this.chainId} (${SupportedChains[this.chainId]})`, true);
  }

  // Helper to handle rate limits
  private async sendWithRetry(hook: Webhook, message: MessageBuilder, retries: number = 3): Promise<void> {
    let attempt = 0;
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    while (attempt < retries) {
      try {
        await hook.send(message);
        return; // exit if successful
      } catch (error: any) {
        if (error.response?.statusCode === 429) {
          // Rate limit error
          const retryAfter = parseInt(error.response?.headers["retry-after"]) * 1000 || 5000;
          console.warn(`Rate limited. Retrying after ${retryAfter / 1000}s...`);
          await delay(retryAfter); // Wait before retrying
        } else {
          console.error("Failed to send message to Discord:", error);
          throw error; // Rethrow error if not rate-limiting
        }
      }
      attempt++;
    }
    console.error("Failed to send message after maximum retries.");
  }

  async sendLiquidationSuccess(_successfulTxs: SimplifiedTransactionReceipt[], msg: string): Promise<void> {
    const baseMessage = this.createBaseMessage();
    
    // Set a vibrant green color for success messages
    baseMessage.setColor(this.infoColor);
    
    // Create an eye-catching success message with emojis and formatting
    const formattedMessage = [
      `**━━━━━━━━━━━━━━━━━━━━━━**`,
      `🎯 **LIQUIDATION SUCCESSFUL** 🎯`,
      `**━━━━━━━━━━━━━━━━━━━━━━**\n`,
      `${msg}`,
      `\n✨ *Transaction completed successfully* ✨`
    ].join('\n');

    baseMessage.setDescription(formattedMessage);

    // Send the beautified message
    await this.sendWithRetry(this.successHook, baseMessage);
  }

  async sendLiquidationFailure(pool: LiquidatablePool, errorMessage: string): Promise<void> {
    const baseMessage = this.createBaseMessage();
    baseMessage.setColor(this.errorColor);
    
    const formattedMessage = [
      `**━━━━━━━━━━━━━━━━━━━━━━**`,
      `❌ **LIQUIDATION FAILED** ❌`,
      `**━━━━━━━━━━━━━━━━━━━━━━**\n`,
      `🔍 **Details:**`,
      `👤 **Borrower:** \`${pool.liquidations[0].borrower}\``,
      `\n⚠️ **Error Message:**`,
      `\`\`\`${errorMessage}\`\`\``,
      `\n*Please check logs for more details*`
    ].join('\n');

    baseMessage.setDescription(formattedMessage);
    await this.sendWithRetry(this.failureHook, baseMessage);
  }

  async sendLiquidationFetchingFailure(_erroredPools: any[], msg: string): Promise<void> {
    const baseMessage = this.createBaseMessage();
    baseMessage.setColor(this.warningColor);
    baseMessage.setDescription(`⚠️ Liquidation Fetching Failed:\n${msg}`);
    await this.sendWithRetry(this.failureHook, baseMessage);
  }
}

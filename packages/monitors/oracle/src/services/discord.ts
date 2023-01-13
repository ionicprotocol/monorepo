import { SupportedAsset, SupportedChains } from "@midas-capital/types";
import { MessageBuilder, Webhook } from "discord-webhook-node";

import { baseConfig } from "../config/variables";
import { logger } from "../logger";
import {
  ErrorKind,
  InitErrorCache,
  InvalidReason,
  PriceFeedInvalidity,
  VerificationErrorCache,
  VerifierInitError,
} from "../types";

export class DiscordService {
  asset: SupportedAsset;
  chainId: SupportedChains;

  private errorColor = 0xa83232;
  // @ts-ignore
  private warningColor = 0xfcdb03;
  // @ts-ignore
  private infoColor = 0x32a832;

  private hook: Webhook;
  private DISABLED_INVALID_REASONS: InvalidReason[] = [InvalidReason.DEFI_LLAMA_API_ERROR];

  initErrorCache: InitErrorCache;
  verificationErrorCache: VerificationErrorCache;
  messageCache: {
    [ErrorKind.init]: InitErrorCache;
    [ErrorKind.verification]: VerificationErrorCache;
  };
  alertFunction: {
    [ErrorKind.init]: (asset: SupportedAsset, error: VerifierInitError) => Promise<void>;
    [ErrorKind.verification]: (asset: SupportedAsset, error: PriceFeedInvalidity) => Promise<void>;
  };

  constructor(chainId: SupportedChains) {
    this.chainId = chainId;
    this.hook = new Webhook(baseConfig.discordWebhookUrl);
    this.initErrorCache = [];
    this.verificationErrorCache = [];
    this.messageCache = {
      [ErrorKind.init]: [],
      [ErrorKind.verification]: [],
    };
    this.alertFunction = {
      [ErrorKind.init]: this.verifierInitError.bind(this),
      [ErrorKind.verification]: this.invalidFeedError.bind(this),
    };
  }

  async sendErrorNotification(error: VerifierInitError | PriceFeedInvalidity, asset: SupportedAsset, kind: ErrorKind) {
    const lastMessageSentIndex = this.messageCache[kind].findIndex(
      (a) => a.asset.underlying === asset.underlying && a.error === error
    );
    if (lastMessageSentIndex !== -1) {
      const lastMessageSent = this.messageCache[kind][lastMessageSentIndex];
      const { timestamp } = lastMessageSent;
      const now = Date.now();
      if (now - timestamp > 1000 * 60 * 60) {
        await this.alertFunction[kind](asset, error);
        this.messageCache[kind][lastMessageSentIndex].timestamp = now;
      }
    } else {
      await this.alertFunction[kind](asset, error);
      this.messageCache[kind].push({ asset, error, timestamp: Date.now() });
    }
  }

  private create(asset: SupportedAsset) {
    return new MessageBuilder()
      .addField("Asset", `${asset.symbol}:  ${asset.underlying}`, true)
      .addField("Chain", `Chain ID: ${SupportedChains[this.chainId]}`, true);
  }

  private async send(embed: MessageBuilder) {
    if (
      baseConfig.environment === "production" &&
      !this.DISABLED_INVALID_REASONS.includes(embed.getJSON().embeds[0].title?.toString() as InvalidReason)
    ) {
      await this.hook.send(embed);
    } else {
      logger.debug(`Would have sent alert to discord: ${JSON.stringify(embed)}`);
    }
  }

  public async invalidFeedError(asset: SupportedAsset, error: PriceFeedInvalidity) {
    const embed = this.create(asset)
      .setTitle(`${error.invalidReason}`)
      .setDescription(`@everyone ${error.message}`)
      .setTimestamp()
      .setColor(this.errorColor);
    await this.send(embed);
  }

  public async verifierInitError(asset: SupportedAsset, error: VerifierInitError) {
    const embed = this.create(asset)
      .setTitle(error.invalidReason)
      .setDescription(error.message)
      .setTimestamp()
      .setColor(this.errorColor);
    await this.send(embed);
  }
}

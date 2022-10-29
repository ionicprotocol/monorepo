import { SupportedAsset, SupportedChains } from "@midas-capital/types";
import { MessageBuilder, Webhook } from "discord-webhook-node";

import { InvalidReason, OracleFailure } from "..";
import { config } from "../config";

export class DiscordAlert {
  asset: SupportedAsset;
  chainId: SupportedChains;

  private errorColor = 0xa83232;
  private warningColor = 0xfcdb03;
  private infoColor = 0x32a832;

  private hook = new Webhook(config.discordWebhookUrl);

  constructor(asset: SupportedAsset, chainId: SupportedChains) {
    this.asset = asset;
    this.chainId = chainId;
  }

  private create() {
    return new MessageBuilder()
      .addField("Asset", `${this.asset.symbol}:  ${this.asset.underlying}`, true)
      .addField("Chain", `Chain ID: ${SupportedChains[this.chainId]}`, true);
  }

  private async send(embed: MessageBuilder) {
    return this.hook.send(embed);
  }

  public async sendInvalidPriceAlert(description: string) {
    const embed = this.create()
      .setTitle(InvalidReason.DEVIATION_ABOVE_THRESHOLD)
      .setDescription(description)
      .setTimestamp()
      .setColor(this.errorColor);
    await this.send(embed);
  }

  public async sendMpoFailureAlert(description: string) {
    const embed = this.create()
      .setTitle(OracleFailure.MPO_FAILURE)
      .setDescription(description)
      .setTimestamp()
      .setColor(this.errorColor);
    await this.send(embed);
  }
  public async sendOracleFailurePriceAlert() {}
}

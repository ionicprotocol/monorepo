import { TransactionResponse } from "@ethersproject/providers";
import { EncodedLiquidationTx, ErroredPool, LiquidatablePool } from "@ionicprotocol/sdk/src/modules/liquidation/utils";
import { SupportedChains } from "@ionicprotocol/types";
import sgMail, { MailDataRequired } from "@sendgrid/mail";

import config from "../config";
import { logger } from "../logger";

export class EmailService {
  lastSentMessages: {
    erroredPools: { pools: Array<ErroredPool>; timestamp: number };
    liquidations: { tx: EncodedLiquidationTx[] | null; timestamp: number };
  };
  chainId: SupportedChains;

  constructor(chainId: SupportedChains) {
    this.chainId = chainId;
    this.lastSentMessages = {
      erroredPools: { pools: [], timestamp: 0 },
      liquidations: { tx: null, timestamp: 0 },
    };
    sgMail.setApiKey(config.sendgridApiKey);
  }

  private create(): MailDataRequired {
    return {
      to: config.sendgridEmailTo,
      from: "rahul@ionic.money",
      text: "",
    };
  }

  private async send(msg: MailDataRequired) {
    if (config.environment === "production") {
      await sgMail.send(msg);
    } else {
      logger.debug(`Would have sent alert to email: ${JSON.stringify(msg)}`);
    }
  }

  public async sendLiquidationFailure(liquidations: LiquidatablePool, msg: string) {
    const { comptroller, liquidations: currentLiquidations } = liquidations;
    const { liquidations: previousLiquidations } = this.lastSentMessages;

    const encodedCurrentLiquidation = JSON.stringify(currentLiquidations);
    const encodedPreviousLiquidation = JSON.stringify(previousLiquidations.tx);

    const lastSentMessages = this.lastSentMessages.liquidations.timestamp;

    if (previousLiquidations.tx === null || encodedPreviousLiquidation !== encodedCurrentLiquidation) {
      if (Date.now() - lastSentMessages > 1000 * 60 * 15 || lastSentMessages === 0) {
        const message = this.create();
        message.subject = `${currentLiquidations.length} liquidation(s) failed for comptroller: ${comptroller}`;
        message.text = `
          Method: ${currentLiquidations[0].method}
          Value: ${currentLiquidations[0].value}
          Args: ${JSON.stringify(currentLiquidations[0].args)}
          ${msg}
        `;
        await this.send(message);
        this.lastSentMessages.liquidations = { tx: liquidations.liquidations, timestamp: Date.now() };
      }
    }
  }
  public async sendLiquidationFetchingFailure(erroredPools: Array<ErroredPool>, msg: string) {
    const erroredComptrollers = erroredPools
      .map((pool) => pool.comptroller)
      .sort()
      .join(",");
    const previouslyErroredComptrollers = this.lastSentMessages.erroredPools.pools
      .map((pool) => pool.comptroller)
      .sort()
      .join(",");
    const lastSentMessages = this.lastSentMessages.erroredPools.timestamp;

    if (previouslyErroredComptrollers === null || previouslyErroredComptrollers !== erroredComptrollers) {
      if (Date.now() - this.lastSentMessages.erroredPools.timestamp > 1000 * 60 * 30 || lastSentMessages === 0) {
        const message = this.create();
        message.subject = `Liquidation fetching failed for pools`;
        message.text = msg;
        await this.send(message);
        this.lastSentMessages.erroredPools = { pools: erroredPools, timestamp: Date.now() };
      } else {
        logger.debug("Not sending errored pools alert, already sent one in the last 30 minutes");
      }
    }
  }
  public async sendLiquidationSuccess(txs: Array<TransactionResponse>, msg: string) {
    const message = this.create();
    message.subject = `${txs.length} liquidation(s) succeded`;
    message.text = msg;
    await this.send(message);
  }
}

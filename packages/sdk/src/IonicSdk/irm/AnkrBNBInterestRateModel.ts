//
import { utils } from "ethers";

import AnkrBNBInterestRateModelArtifact from "../../../artifacts/AnkrBNBInterestRateModel.json";

import AnkrCertificateInterestRateModel from "./AnkrCertificateInterestRateModel";

export default class AnkrBNBInterestRateModel extends AnkrCertificateInterestRateModel {
  static RUNTIME_BYTECODE_HASH = utils.keccak256(AnkrBNBInterestRateModelArtifact.deployedBytecode.object);
}

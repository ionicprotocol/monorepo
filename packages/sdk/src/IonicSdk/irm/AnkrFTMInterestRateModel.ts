//
import { utils } from "ethers";

import AnkrFTMInterestRateModelArtifact from "../../../artifacts/AnkrFTMInterestRateModel.sol/AnkrFTMInterestRateModel.json";

import AnkrCertificateInterestRateModel from "./AnkrCertificateInterestRateModel";

export default class AnkrFTMInterestRateModel extends AnkrCertificateInterestRateModel {
  static RUNTIME_BYTECODE_HASH = utils.keccak256(AnkrFTMInterestRateModelArtifact.deployedBytecode.object);
}

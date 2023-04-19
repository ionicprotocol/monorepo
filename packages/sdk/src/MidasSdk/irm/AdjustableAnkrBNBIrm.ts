import { utils } from "ethers";

import AdjustableAnkrBNBIrmArtifact from "../../../artifacts/AdjustableAnkrBNBIrm.json";

import JumpRateModel from "./JumpRateModel";

export default class AdjustableAnkrBNBIrm extends JumpRateModel {
  static RUNTIME_BYTECODE_HASH = utils.keccak256(AdjustableAnkrBNBIrmArtifact.deployedBytecode.object);
}

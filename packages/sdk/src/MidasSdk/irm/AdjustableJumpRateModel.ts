import { utils } from "ethers";

import AdjustableJumpRateModelArtifact from "../../../lib/contracts/out/AdjustableJumpRateModel.sol/AdjustableJumpRateModel.json";

import JumpRateModel from "./JumpRateModel";

export default class AdjustableJumpRateModel extends JumpRateModel {
  static RUNTIME_BYTECODE_HASH = utils.keccak256(AdjustableJumpRateModelArtifact.deployedBytecode.object);
}

import { Hex, keccak256 } from "viem";

import AdjustableJumpRateModelArtifact from "../../../artifacts/AdjustableJumpRateModel.sol/AdjustableJumpRateModel.json";

import JumpRateModel from "./JumpRateModel";

export default class AdjustableJumpRateModel extends JumpRateModel {
  static RUNTIME_BYTECODE_HASH = keccak256(AdjustableJumpRateModelArtifact.deployedBytecode.object as Hex);
}

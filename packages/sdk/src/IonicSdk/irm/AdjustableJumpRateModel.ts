import AdjustableJumpRateModelArtifact from "@ionicprotocol/contracts/artifacts/contracts/ionic/irms/AdjustableJumpRateModel.sol/AdjustableJumpRateModel.json";
import { Hex, keccak256 } from "viem";

import JumpRateModel from "./JumpRateModel";

export default class AdjustableJumpRateModel extends JumpRateModel {
  static RUNTIME_BYTECODE_HASH = keccak256(AdjustableJumpRateModelArtifact.deployedBytecode as Hex);
}

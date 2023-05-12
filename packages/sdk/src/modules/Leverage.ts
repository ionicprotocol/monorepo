import { CreateContractsModule } from "./CreateContracts";

export function withLeverage<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Leverage extends Base {
  };
}

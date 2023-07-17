import chai from "chai";
import promised from "chai-as-promised";
import subset from "chai-subset";
import { reset, restore } from "sinon";
import sinonChai from "sinon-chai";

let chaiPlugin = chai.use(subset);
chaiPlugin = chaiPlugin.use(promised);
chaiPlugin = chaiPlugin.use(sinonChai);

export const expect = chaiPlugin.expect;

export const mochaHooks = {
  afterEach() {
    restore();
    reset();
  }
};

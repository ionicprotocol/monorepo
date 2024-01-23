import chai from "chai";
import promised from "chai-as-promised";
import subset from "chai-subset";
import { reset, restore } from "sinon";

let chaiPlugin = chai.use(subset);
chaiPlugin = chaiPlugin.use(promised);

export const expect = chaiPlugin.expect;

export const mochaHooks = {
  beforeEach() {},
  afterEach() {
    restore();
    reset();
  },
};

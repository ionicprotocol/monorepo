import chai from "chai";
import promised from "chai-as-promised";
import subset from "chai-subset";
import { reset, restore } from "sinon";

let chaiPlugin = chai.use(subset);
chaiPlugin = chaiPlugin.use(promised);

export const expect = chaiPlugin.expect;

export const mochaHooks = {
  beforeEach() {
    // const env = process.env;
    process.env.SERVICE_TO_RUN = "feed-verifier";
  },
  afterEach() {
    restore();
    reset();
  },
};

import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "../sdk/src/generated.ts",
  contracts: [],
  plugins: [
    foundry({
      project: "./"
    })
  ]
});

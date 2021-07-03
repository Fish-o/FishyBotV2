import {
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";

export const run: FishyCommandCode = async (client, interaction) => {};

export const config: FishyCommandConfig = {
  name: "time",
  bot_needed: false,
  interaction_options: {
    name: "time",
    description: "Time zone utilities!",
    options: [],
  },
};

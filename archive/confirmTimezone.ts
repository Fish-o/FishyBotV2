import {
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";

export const run: FishyCommandCode = async (client, interaction) => {};

export const config: FishyCommandConfig = {
  name: "confirmtz",
  bot_needed: false,
  interaction_options: {
    name: "confirmtz",
    description: "Confirm your timezone",
  },
};

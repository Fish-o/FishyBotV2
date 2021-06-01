import {
  FishyButtonCommandCode,
  FishyButtonCommandConfig,
} from "fishy-bot-framework/lib/types";
import { PressButton } from "./Snake";

export const run: FishyButtonCommandCode = async (client, interaction) => {
  interaction.deferButton();
  const custom_id = interaction.customID;
  const data = custom_id.slice(config.custom_id.length).split("|");
  const button = data[0];
  PressButton(interaction.raw_user.id, button);
};

export const config: FishyButtonCommandConfig = {
  custom_id: "snake_",
  user_perms: [],
  atStart: true,
  bot_needed: false,
};

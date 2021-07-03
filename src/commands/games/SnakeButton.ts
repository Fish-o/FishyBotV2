import {
  FishyComponentCommandCode,
  FishyComponentCommandConfig,
} from "fishy-bot-framework/lib/types";
import { PressButton } from "./Snake";

export const run: FishyComponentCommandCode = async (client, interaction) => {
  interaction.deferUpdateMessage();
  const custom_id = interaction.data.custom_id;
  const data = custom_id.slice(config.custom_id.length).split("|");
  const button = data[0];
  PressButton(interaction.raw_user.id, button);
};

export const config: FishyComponentCommandConfig = {
  custom_id: "snake_",
  user_perms: [],
  atStart: true,
  bot_needed: false,
};

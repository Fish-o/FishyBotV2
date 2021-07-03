import {
  FishyComponentCommandCode,
  FishyComponentCommandConfig,
} from "fishy-bot-framework/lib/types";
import { unMuteMember } from "./mute";

export const run: FishyComponentCommandCode = async (client, interaction) => {
  const custom_id = interaction.data.custom_id;
  const data = custom_id.slice("unmute_".length).split("|");
  const memberID = data[0];
  await unMuteMember(interaction, memberID);
};

export const config: FishyComponentCommandConfig = {
  custom_id: "unmute_",
  user_perms: ["MANAGE_MESSAGES"],
  atStart: true,
  bot_needed: true,
};

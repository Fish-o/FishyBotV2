import {
  FishyButtonCommandCode,
  FishyButtonCommandConfig,
} from "fishy-bot-framework/lib/types";
import { unMuteMember } from "./mute";

export const run: FishyButtonCommandCode = async (client, interaction) => {
  const custom_id = interaction.customID;
  const data = custom_id.slice("unmute_".length).split("|");
  const memberID = data[0];
  await unMuteMember(interaction, memberID);
};

export const config: FishyButtonCommandConfig = {
  custom_id: "unmute_",
  user_perms: ["MANAGE_MESSAGES"],
  atStart: true,
  bot_needed: true,
};

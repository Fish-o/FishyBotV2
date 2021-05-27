import {
  FishyButtonCommandCode,
  FishyButtonCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";
import ms from "ms";
import { muteMember } from "./mute";

export const run: FishyButtonCommandCode = async (client, interaction) => {
  const custom_id = interaction.customID;
  const data = custom_id.slice("mute_".length).split("|");
  const memberID = data[0];
  const time = data[1];
  await muteMember(interaction, memberID, time ? ms(time) : undefined);
};

export const config: FishyButtonCommandConfig = {
  custom_id: "mute_",
  user_perms: ["MANAGE_MESSAGES"],
  atStart: true,
  bot_needed: true,
};

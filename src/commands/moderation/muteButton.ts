import {
  FishyComponentCommandCode,
  FishyComponentCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";
import ms from "ms";
import { muteMember } from "./mute";

export const run: FishyComponentCommandCode = async (client, interaction) => {
  const custom_id = interaction.data.custom_id;
  const data = custom_id.slice("mute_".length).split("|");
  const memberID = data[0];
  const time = data[1];
  await muteMember(interaction, memberID, time ? ms(time) : undefined);
};

export const config: FishyComponentCommandConfig = {
  custom_id: "mute_",
  user_perms: ["MANAGE_MESSAGES"],
  atStart: true,
  bot_needed: true,
};

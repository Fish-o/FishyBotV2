import {
  ComponentStyle,
  ComponentType,
  FishyComponentCommandCode,
  FishyComponentCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";

export const run: FishyComponentCommandCode = async (client, interaction) => {
  interaction.send(`${interaction.member} pressed me :(`);
};

export const config: FishyComponentCommandConfig = {
  custom_id: "selfyeet",
  atStart: true,
  bot_needed: true,
};

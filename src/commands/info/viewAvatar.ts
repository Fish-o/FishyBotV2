import { MessageEmbed } from "discord.js";
import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";

export const run: FishyCommandCode = async (client, interaction) => {
  const url = `https://cdn.discordapp.com/avatars/${
    interaction.data.mentions?.users?.first()?.id || interaction.member?.id
  }/${
    interaction.data.mentions?.users?.first()?.avatar ||
    interaction.member?.user.avatar
  }.png?size=256`;
  interaction.send(new MessageEmbed().setImage(url).setTitle(`Avatar`));
};

export const config: FishyCommandConfig = {
  name: "avatar",
  bot_needed: false,
  interaction_options: {
    name: "avatar",
    description: "Get the avatar of a user",
    options: [
      {
        name: "user",
        description: "The user to get the avatar of",
        type: ApplicationCommandOptionType.USER,
      },
    ],
  },
};

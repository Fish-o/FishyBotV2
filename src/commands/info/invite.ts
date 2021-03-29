import { FishyCommandCode, FishyCommandConfig, FishyCommandHelp } from "fishy-bot-framework/lib/types";


export const run: FishyCommandCode = async (client, interaction) => {
  interaction.sendSilent(`https://discord.com/api/oauth2/authorize?client_id=${client.user!.id}&permissions=8&scope=bot%20applications.commands`)
};

export const config: FishyCommandConfig = {
  name: "invite",
  bot_needed: false,
  interaction_options: {
    name: "invite",
    description: "Get an invite link for the bot"
  },
};
export const help: FishyCommandHelp = {
  description: "Get an invite link for the bot",
  usage: "/invite",
};
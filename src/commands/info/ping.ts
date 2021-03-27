import { FishyCommandCode, FishyCommandConfig, FishyCommandHelp } from "fishy-bot-framework/lib/types";


export const run: FishyCommandCode = async (client, interaction) => {
  interaction.sendSilent('Pong!')
};

export const config: FishyCommandConfig = {
  name: "ping",
  bot_needed: false,
  interaction_options: {
    name: "ping",
    description: "Ping the bot"
  },
};
export const help: FishyCommandHelp = {
  description: "Pong!?",
  usage: "/ping",
};
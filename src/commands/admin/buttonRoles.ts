import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";

export const run: FishyCommandCode = async (client, interaction) => {
  interaction.sendSilent("Pong!");
};

export const config: FishyCommandConfig = {
  name: "button-roles",
  bot_needed: true,
  interaction_options: {
    user_perms: ["ADMINISTRATOR"],
    name: "button-roles",
    description: "Create a button role setup",
    options: [
      {
        name: "add-button",
        description: "Add a button role to a message",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "message",
            description: "The ID of the message to add a button to",
            type: ApplicationCommandOptionType.STRING,
          },
        ],
      },
    ],
  },
};

import { MessageEmbed } from "discord.js";
import {
  ComponentStyle,
  ComponentType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";

export const run: FishyCommandCode = async (client, interaction) => {
  const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${
    client.user!.id
  }&permissions=8&scope=bot%20applications.commands`;

  interaction.sendSilent("Click the button below", {
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ComponentStyle.Link,
            url: inviteLink,
            label: "Click here to invite FishyBot into a server!",
          },
        ],
      },
    ],
  });
};

export const config: FishyCommandConfig = {
  name: "invite",
  bot_needed: false,
  interaction_options: {
    name: "invite",
    description: "Get an invite link for the bot",
  },
};

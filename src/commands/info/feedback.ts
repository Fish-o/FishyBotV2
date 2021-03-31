import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
  FishyCommandHelp,
} from "fishy-bot-framework/lib/types";

export const run: FishyCommandCode = async (client, interaction) => {
  const channel = await client.channels.fetch("826731687785791488");
  if (!channel.isText()) return;
  const action = interaction.data.options[0].name;
  if (typeof action !== "string")
    return interaction.send(`Lorem ipsum dolor sit amet`);
  if (action === "feature") {
    const text = interaction.data.options[0].options.find(
      (opt) => opt.name === "text"
    );
    const invite = interaction.data.options[0].options.find(
      (opt) => opt.name === "invite"
    )?.value;
    if (typeof text !== "string") return interaction.sendSilent(">:(");
    channel.send(`**FEATURE REQUEST**
Guild: \`${interaction.guild?.name}\`
Channel: \`${interaction.channel?.name}\`
Member: \`${interaction.member?.user.tag}\`
Invite: \`${
      invite
        ? await interaction.channel?.createInvite({
            maxAge: 0,
            maxUses: 0,
          })
        : "`No invite provided`"
    }
Feature: 
\`\`\`
${text}
\`\`\``);
  } else if (action === "bug") {
    const text = interaction.data.options[0].options.find(
      (opt) => opt.name === "text"
    )?.value;
    const invite = interaction.data.options[0].options.find(
      (opt) => opt.name === "invite"
    )?.value;
    if (typeof text !== "string") return interaction.sendSilent(">:(");
    channel.send(`**BUG REPORT**
Guild: \`${interaction.guild?.name}\`
Channel: \`${interaction.channel?.name}\`
Member: \`${interaction.member?.user.tag}\`
Invite: ${
      invite
        ? await interaction.channel?.createInvite({
            maxAge: 0,
            maxUses: 0,
          })
        : "`No invite provided`"
    }
Bug: 
\`\`\`
${text}
\`\`\``);
  }
};

export const config: FishyCommandConfig = {
  name: "feedback",
  bot_needed: true,
  user_perms: ["MANAGE_MESSAGES"],
  interaction_options: {
    name: "feedback",
    description: "Give feedback about the bot",
    options: [
      {
        name: "feature",
        description: "Make a feature request",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "text",
            description: "Describe the feature that you want",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
          {
            name: "invite",
            description:
              "Send an invite to join the server together with the bug report",
            type: ApplicationCommandOptionType.BOOLEAN,
          },
        ],
      },
      {
        name: "bug",
        description: "Make a bug report",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "text",
            description: "Describe the bug that happens",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
          {
            name: "invite",
            description: "Send an invite together with the feature request",
            type: ApplicationCommandOptionType.BOOLEAN,
          },
        ],
      },
    ],
  },
};
export const help: FishyCommandHelp = {
  description: "feedback",
  usage: "/feedback [new/bug] text: blah [sendinvite]",
};

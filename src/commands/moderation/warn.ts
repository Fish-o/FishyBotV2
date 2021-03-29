import { EmbedFieldData, Message, MessageEmbed } from "discord.js";
import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
  FishyCommandHelp,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";

export interface warnObject {
  timestamp: number;
  warner: string; // Should be a discord id
  reason?: string;
  removed?: boolean;
}

export const run: FishyCommandCode = async (client, interaction) => {
  console.log(interaction.raw_interaction);
  if (!interaction.args[0]?.options)
    return interaction.sendSilent("Stop breaking shit >:(");
  const action = interaction.args[0]?.name;
  if (!action || !["add", "list", "remove"].includes(action))
    return interaction.sendSilent("Stop breaking shit >:(");

  if (action === "add") {
    const memberId = interaction.args[0].options.find(
      (arg) => arg.name === "member"
    )?.value;
    let reason = interaction.args[0].options.find(
      (arg) => arg.name === "reason"
    )?.value;
    if (!memberId) {
      return interaction.send(new ErrorEmbed("Please enter a member to warn"));
    }
    reason = reason || "No reason provided";

    if (typeof memberId !== "string" || typeof reason !== "string")
      return interaction.sendSilent("Just stop pls");

    const warn: warnObject = {
      timestamp: Date.now(),
      warner: interaction.member?.id!,
      reason: reason,
    };
    if (!warn.warner)
      throw Error(
        "Could not get warner name, does this server have the bot in it?"
      );

    await interaction.updateDbGuild({
      $push: {
        [`warnings.${memberId}`]: { $each: [warn] }, //$position: -1 },
      },
    });
    var bad_pfp = interaction.client.users.cache.get(memberId)?.avatarURL();
    const embed = new MessageEmbed();
    embed.setColor("#ff2222");
    embed.setTitle(
      `Member: "${
        interaction.data.mentions?.users?.first()?.username
      }" has been warned`
    );
    embed.addField("Reason: ", reason);
    embed.setThumbnail(bad_pfp || "");
    interaction.send(embed);
  } else if (action === "list") {
    const memberId = interaction.args[0].options.find(
      (arg) => arg.name === "member"
    )?.value;
    if (!memberId) {
      return interaction.send(
        new ErrorEmbed("Please enter a name to view the warning from")
      );
    }
    if (typeof memberId !== "string") return interaction.sendSilent("Buh");
    const db_guild = await interaction.getDbGuild();
    const user_warnins: Array<warnObject> = db_guild.warnings[memberId];
    const member = await interaction.guild?.members.fetch(memberId);
    if (
      !user_warnins ||
      !user_warnins[0] ||
      !user_warnins.find((warn) => !warn.removed)
    ) {
      return interaction.send(
        new MessageEmbed()
          .setTimestamp()
          .setColor("GREEN")
          .setTitle(`No warnings found for: ${member?.user.tag}`)
          .setDescription(
            `To warn this member run \`/warn add member: ${member?.displayName}\``
          )
      );
    }
    const embed = new MessageEmbed();
    embed.setColor("#ff00ff");
    embed.setTitle("Warnings for user: " + member?.user.tag);
    embed.addFields(
      user_warnins
        .filter((warn) => !warn.removed)
        .map((warning) => {
          var date_time = new Date(warning.timestamp).toDateString();
          try {
            let data: EmbedFieldData = {
              name: `#${user_warnins.indexOf(warning)} - ${date_time} - by ${
                client.users.cache.get(warning.warner)?.tag
              }`,
              value: `Reason: \`${warning.reason}\``,
            };
            return data;
          } catch (err) {
            console.error(err);
            let data: EmbedFieldData = {
              name: `hmmm`,
              value: `It broke :)`,
            };
            return data;
          }
        })
    );
    embed.setThumbnail(member?.user.avatarURL()!);
    embed.setTimestamp();
    interaction.send(embed);
  } else if (action === "remove") {
    const memberId: String = `${
      interaction.data.mentions?.users?.first()?.id ||
      interaction.data.options[0].options.find((arg) => arg.name === "member")
        ?.value
    }`;
    const id = interaction.data.options[0].options.find(
      (arg) => arg.name === "id"
    )?.value;
    if (typeof memberId !== "string" || typeof id !== "number") return;
    const db_guild = await interaction.getDbGuild();
    if (!db_guild.warnings[memberId]) {
      return interaction.send(
        new ErrorEmbed(
          `There is no warning #${id} for "${
            interaction.guild?.members.cache.get(memberId)?.user.tag
          }"`
        )
      );
    } else if (db_guild.warnings[memberId].removed == true) {
      return interaction.send(
        new ErrorEmbed(`The warning #${id} for "${
          interaction.guild?.members.cache.get(memberId)?.user.tag
        }" was already deleted
      `)
      );
    }
    let res = await interaction.updateDbGuild({
      $set: { [`warnings.${memberId}.${id}.removed`]: true },
    });
    const embed = new MessageEmbed()
      .setColor("BLUE")
      .setTimestamp()
      .setTitle("Removed warning")
      .setDescription(
        `Succesfully removed warning #${id} from "${interaction.guild?.members.cache.get(
          memberId
        )}"`
      );
    interaction.send(embed);
  }
};

export const config: FishyCommandConfig = {
  name: "warn",
  bot_needed: true,
  user_perms: ["MANAGE_MESSAGES"],
  interaction_options: {
    name: "warn",
    description: "Warn a member",
    options: [
      {
        name: "add",
        description: "Add a warning",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "member",
            description: "The member to warn",
            type: ApplicationCommandOptionType.USER,
            required: true,
          },
          {
            name: "reason",
            description: "The reason for warning that member",
            type: ApplicationCommandOptionType.STRING,
          },
        ],
      },
      {
        name: "list",
        description: "View a members warnings",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "member",
            description: "The member to view the warnings of",
            type: ApplicationCommandOptionType.USER,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "Remove a warning from a member",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "member",
            description: "The member to remove the warning from",
            type: ApplicationCommandOptionType.USER,
            required: true,
          },
          {
            name: "id",
            description: "The id of warning to remove",
            type: ApplicationCommandOptionType.INTEGER,
            required: true,
          },
        ],
      },
    ],
  },
};
export const help: FishyCommandHelp = {
  description: "Warn a member",
  usage: "/warn [add/list/remove] member",
};

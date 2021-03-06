import { GuildMember, MessageEmbed, User } from "discord.js";
import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";

export const run: FishyCommandCode = async (client, interaction) => {
  console.log(interaction.raw_interaction);
  const member_id = interaction.data.options.find(
    (arg) => arg.name == "member"
  )?.value;
  if (!member_id) {
    return interaction.send(
      new ErrorEmbed("Please enter a member whom to kick")
    );
  }
  if (typeof member_id !== "string")
    return interaction.sendSilent(
      ">:(((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((("
    );
  const member = await interaction.guild!.members.fetch(member_id);
  if (!member) {
    return interaction.send(new ErrorEmbed("Could not find that member"));
  }

  const failed_embed = new ErrorEmbed(
    "Could not kick that member",
    `A few things that could cause this:
1) Does the user has a role higher then the FishyBot role?
2) Does FishyBot have neither of the "kick members" or "administrator" permissions?
3) Is that person the server owner?`
  );

  if (!member.kickable) {
    return interaction.send(failed_embed);
  }
  try {
    let guild_member = await member.kick(member_id);
    interaction.send(
      new ErrorEmbed(
        `Successfully kicked user "${guild_member.user.tag}"`
      ).setColor("GREEN")
    );
  } catch (err) {
    console.error(err);
    interaction.send(failed_embed);
  }
};

export const config: FishyCommandConfig = {
  name: "kick",
  bot_needed: true,
  user_perms: ["KICK_MEMBERS"],
  bot_perms: ["KICK_MEMBERS"],
  interaction_options: {
    name: "kick",
    description: "Kick a member from this server",
    options: [
      {
        required: true,
        name: "member",
        description: "Member whom to kick",
        type: ApplicationCommandOptionType.USER,
      },
    ],
  },
};

import { GuildMember, User } from "discord.js";
import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";
import { mute_role_name } from "./mute";

export const run: FishyCommandCode = async (client, interaction) => {
  if (!interaction.guild) return;
  console.log(interaction.raw_interaction);
  const action = interaction.data.options[0]?.name;
  if (!action) return;
  if (action === "mute") {
    if (!interaction.member?.hasPermission("MANAGE_MESSAGES"))
      return interaction.sendSilent("oi, nice try mate");
    const toUnMuteRaw = interaction.data.mentions?.users?.first();
    const toUnMute = await interaction.guild?.members.fetch(
      toUnMuteRaw?.id || ""
    );
    if (!toUnMuteRaw || !toUnMute) {
      return interaction.send(new ErrorEmbed("Please enter somone to unmute"));
    }
    const member = interaction.member;
    if (!member)
      throw Error(
        "SOMEHOW YOU DONT FUCKING EXIST OR SOMETHING IM TO F-ING TIRED FOR THIS"
      );
    let muterole = interaction.guild.roles.cache.find(
      (role) => role.name === mute_role_name
    )!;
    if (!muterole) {
      return new ErrorEmbed(
        "Could not find the muted role",
        `Couldnt find the mute role "${mute_role_name}"`
      );
    }

    try {
      if (!toUnMute.roles.cache.has(muterole.id)) {
        return interaction.send(
          `Tried to unmute ${toUnMute}, but they already seem to be unmuted!`
        );
      }
      await toUnMute.roles.remove(muterole);
      interaction.send(`${toUnMute} has been unmuted by ${member}`);
    } catch (err) {
      interaction.send(
        new ErrorEmbed(
          `Failed to unmute ${toUnMute.displayName}!`,
          `Failed to unmute the member: ${toUnMute}`
        )
      );
    }
  } else if (action == "ban") {
    const user_id = interaction.data.options!.find((arg) => arg.name == "user")
      ?.value;
    if (!user_id) {
      return interaction.send(new ErrorEmbed("Please enter a user to un-ban"));
    }
    if (typeof user_id !== "string")
      return interaction.sendSilent("just stfu ok?");
    try {
      if (!interaction.member?.hasPermission("BAN_MEMBERS"))
        return interaction.sendSilent("oi, nice try mate");
      let guild_member = await interaction.guild!.members.ban(user_id);
      let name = "";
      if (guild_member instanceof GuildMember) name = guild_member.user.tag;
      else if (guild_member instanceof User) name = guild_member.tag;
      else name = guild_member;

      interaction.send(
        new ErrorEmbed(`Succesfully un-banned user "${name}"`).setColor("GREEN")
      );
    } catch (err) {
      console.error(err);
      interaction.send(new ErrorEmbed("Could not un-ban that user", `:(`));
    }
  }
};

export const config: FishyCommandConfig = {
  name: "un",
  bot_needed: true,
  bot_perms: ["MANAGE_ROLES", "BAN_MEMBERS"],
  interaction_options: {
    name: "un",
    description: "Reverse previous actions",
    options: [
      {
        name: "mute",
        description: "Unmute a guild member",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "member",
            description: "The member to unmute",
            type: ApplicationCommandOptionType.USER,
            required: true,
          },
        ],
      },
      {
        name: "ban",
        description: "Un ban someone",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "user",
            description: "The user to unban",
            type: ApplicationCommandOptionType.USER,
            required: true,
          },
        ],
      },
    ],
  },
};

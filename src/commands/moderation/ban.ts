import { GuildMember, MessageEmbed, User } from "discord.js";
import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
  FishyCommandHelp,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";

export const run: FishyCommandCode = async (client, interaction) => {
  const user_id = interaction.data.options.find((arg) => arg.name == "user")
    ?.value;
  if (!user_id) {
    return interaction.send(new ErrorEmbed("Please enter a user whom to ban"));
  }
  if (typeof user_id !== "string")
    return interaction.sendSilent("potat < topat :D");
  try {
    let guild_member = await interaction.guild!.members.ban(user_id);
    let name = "";
    if (guild_member instanceof GuildMember) name = guild_member.user.tag;
    else if (guild_member instanceof User) name = guild_member.tag;
    else name = guild_member;

    interaction.send(
      new ErrorEmbed(`Succesfully banned user "${name}"`).setColor("GREEN")
    );
  } catch (err) {
    console.error(err);
    interaction.send(
      new ErrorEmbed(
        "Could not ban that user",
        `A few things that could cause this:
1) Does the user has a role higher then the FishyBot role?
2) Does FishyBot have neither of the "ban members" or "administator" permissions?
3) Is that person the server owner?`
      )
    );
  }
};

export const config: FishyCommandConfig = {
  name: "ban",
  bot_needed: true,
  user_perms: ["BAN_MEMBERS"],
  bot_perms: ["BAN_MEMBERS"],
  interaction_options: {
    name: "ban",
    description: "Ban a member from this server",
    options: [
      {
        required: true,
        name: "user",
        description: "User whom to ban",
        type: ApplicationCommandOptionType.USER,
      },
    ],
  },
};
export const help: FishyCommandHelp = {
  description: "Ban a member from this server",
  usage: "/ban user: user",
};

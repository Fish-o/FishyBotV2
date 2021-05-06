import { GuildMember, MessageEmbed, User } from "discord.js";
import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";

export const run: FishyCommandCode = async (client, interaction) => {
  console.log(interaction.raw_interaction);
  const member_id = interaction.data.mentions?.users?.first()?.id;
  if (!member_id) {
    return interaction.send(
      new ErrorEmbed("Please enter a member whom to yeeeeeeeeeeeeeet")
    );
  }
  const member = await interaction.guild!.members.fetch(member_id);
  if (!member) {
    return interaction.send(
      new ErrorEmbed("That member invisible or somethin")
    );
  }

  const failed_embed = new ErrorEmbed("Could not yeet that member, yo");

  if (!member.kickable) {
    return interaction.send(failed_embed);
  }
  try {
    const invite =
      (await interaction.guild?.fetchInvites())?.find(
        (inv) =>
          !inv.expiresTimestamp ||
          inv.expiresTimestamp >= Date.now() + 2 * 24 * 60 * 60 * 1000
      ) ||
      (await interaction.channel?.createInvite({
        maxAge: 0,
        maxUses: 0,
      }));
    if (!invite?.url) {
      return interaction.send(failed_embed);
    }
    await member.user.send(
      `You got YEETED from \`${interaction.guild}\` by \`${interaction.user?.tag}\`, use this link to unyeet yourself! \n` +
        invite.url
    );

    let guild_member = await member.kick(member_id);
    interaction.send(
      new ErrorEmbed(`"${guild_member.user.tag}" got YEETed!`).setColor("GREEN")
    );
  } catch (err) {
    console.error(err);
    interaction.send(failed_embed.setDescription(err));
  }
};

export const config: FishyCommandConfig = {
  name: "yeet",
  bot_needed: true,
  user_perms: ["KICK_MEMBERS", "CREATE_INSTANT_INVITE"],
  bot_perms: ["KICK_MEMBERS", "CREATE_INSTANT_INVITE"],
  interaction_options: {
    name: "yeet",
    description: "YEET a member from this server",
    options: [
      {
        required: true,
        name: "member",
        description: "Member whom to yeet to the stratosphere",
        type: ApplicationCommandOptionType.USER,
      },
    ],
  },
};

import {
  FishyComponentCommandCode,
  FishyComponentCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";

export const run: FishyComponentCommandCode = async (client, interaction) => {
  const custom_id = interaction.data.custom_id;
  const data = custom_id.slice("kick_".length).split("|");
  const memberID = data[0];
  try {
    if (!interaction.member || !interaction.guild)
      return interaction.send("This command can only be run in a server");
    const member = await interaction.guild.members.fetch(memberID);
    if (!member)
      return interaction.send(new ErrorEmbed("The member doesn't exists"));
    if (!member.kickable)
      return interaction.send(new ErrorEmbed("Cannot kick that member"));
    await member.kick("Kick button ran");
    interaction.send(
      new ErrorEmbed(`Successfully kicked user "${member.user.tag}"`).setColor(
        "GREEN"
      )
    );
  } catch (err) {
    console.log(err);
    return interaction.send(new ErrorEmbed("Failed to kick that member"));
  }
};

export const config: FishyComponentCommandConfig = {
  custom_id: "kick_",
  user_perms: ["KICK_MEMBERS"],
  atStart: true,
  bot_needed: true,
};

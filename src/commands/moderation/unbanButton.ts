import {
  ComponentStyle,
  ComponentType,
  FishyComponentCommandCode,
  FishyComponentCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";

export const run: FishyComponentCommandCode = async (client, interaction) => {
  const custom_id = interaction.data.custom_id;
  const data = custom_id.slice("unban_".length).split("|");
  const memberID = data[0];
  if (!interaction.member || !interaction.guild)
    return interaction.send("This command can only be run in a server");
  const bans = await interaction.guild.fetchBans();
  try {
    const user = await interaction.client.users.fetch(memberID);
    if (user) {
      if (!bans.has(memberID))
        return interaction.send(
          new ErrorEmbed("That user doesn't seem to be banned!")
        );
      await interaction.guild.members.unban(user);
    } else {
      const data = bans.get(memberID);
      if (!data || !data.user)
        return interaction.send(new ErrorEmbed(`Could not find that user`));
      await interaction.guild.members.unban(data.user);
    }
    interaction.send(
      new ErrorEmbed(`Successfully unbanned user "${user.tag}"`).setColor(
        "GREEN"
      )
    );
  } catch (err) {
    console.log(err);
    return interaction.send(new ErrorEmbed("Failed to unban that member"));
  }
};

export const config: FishyComponentCommandConfig = {
  custom_id: "unban_",
  user_perms: ["BAN_MEMBERS"],
  atStart: true,
  bot_needed: true,
};

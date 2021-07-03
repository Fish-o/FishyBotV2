import {
  ComponentStyle,
  ComponentType,
  FishyComponentCommandCode,
  FishyComponentCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";

export const run: FishyComponentCommandCode = async (client, interaction) => {
  const custom_id = interaction.data.custom_id;
  const data = custom_id.slice("ban_".length).split("|");
  const memberID = data[0];
  try {
    if (!interaction.member || !interaction.guild)
      return interaction.send("This command can only be run in a server");
    const member = await interaction.guild.members.fetch(memberID);
    if (!member)
      return interaction.send(new ErrorEmbed("The member doesn't exists"));
    if (!member.bannable)
      return interaction.send(new ErrorEmbed("Cannot ban that member"));
    await member.ban({ reason: "ban button ran" });
    interaction.send(
      new ErrorEmbed(`Successfully banned user "${member.user.tag}"`).setColor(
        "GREEN"
      ),
      {
        components: [
          {
            components: [
              {
                type: ComponentType.Button,
                style: ComponentStyle.Success,
                label: "Unban",
                custom_id: `unban_${memberID}`,
              },
            ],
            type: ComponentType.ActionRow,
          },
        ],
      }
    );
  } catch (err) {
    console.log(err);
    return interaction.send(new ErrorEmbed("Failed to kick that member"));
  }
};

export const config: FishyComponentCommandConfig = {
  custom_id: "ban_",
  user_perms: ["BAN_MEMBERS"],
  atStart: true,
  bot_needed: true,
};

import { CategoryChannel, MessageEmbed } from "discord.js";
import {
  FishyComponentCommandCode,
  FishyComponentCommandConfig,
} from "fishy-bot-framework/lib/types";
import ms from "ms";
export const run: FishyComponentCommandCode = async (client, interaction) => {
  const custom_id = interaction.data.custom_id;
  const data = custom_id.slice(config.custom_id.length).split("|");

  if (interaction.message.createdTimestamp + ms("24h") < Date.now())
    return interaction.sendSilent("The command has expired ");
  const userID = data.shift();
  const sourceID = data.shift();
  const destinationID = data.shift();

  if (!userID || !sourceID || !destinationID)
    return interaction.send("Invalid button a9y2398hfaodsnf98y329hf");
  else if (userID !== interaction.user.id)
    return interaction.sendSilent("You aren't permitted to do this");
  else if (!interaction.guild)
    return interaction.send("This command can only be used in a server.");
  const guild = interaction.guild;
  const source = guild.channels.cache.get(sourceID);
  const destination = guild.channels.cache.get(destinationID);
  if (
    !(source instanceof CategoryChannel) ||
    !(destination instanceof CategoryChannel)
  )
    return interaction.send("Invalid channels");

  await interaction.deferUpdateMessage();
  const embed = new MessageEmbed()
    .setColor("GREEN")
    .setTitle("Moved category channels!")
    .setDescription(`Successfully moved these channels from <#${
    source.id
  }> to <#${destination.id}>
${source.children.map((channel) => `<#${channel.id}>\n`)}`);
  source.children.forEach(async (child) => child.setParent(destinationID));

  interaction.edit(embed, { components: [] });
};
export const config: FishyComponentCommandConfig = {
  custom_id: "moveCat_",
  user_perms: ["MANAGE_CHANNELS"],
  atStart: true,
  bot_needed: true,
};

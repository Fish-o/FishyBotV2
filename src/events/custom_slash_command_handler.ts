import { WSEventType } from "discord.js";
import { FishyClient } from "fishy-bot-framework";
import { Interaction } from "fishy-bot-framework/lib/structures/Interaction";
import { SlashCommand } from "fishy-bot-framework/lib/structures/SlashCommand";
import {
  raw_received_application_command,
  raw_received_interaction,
} from "fishy-bot-framework/lib/types";
import { custom_slash_commands, ParseFishyCode } from "../utils/fishycode";

export const trigger: WSEventType | string = "INTERACTION_CREATE";
export async function run(
  client: FishyClient,
  raw_interaction: raw_received_application_command
) {
  if (raw_interaction.type !== 2) return;
  if (client.commands.has(raw_interaction.data?.name || "")) return;

  const interaction = new SlashCommand(client, raw_interaction);
  const db_guild = await interaction.getDbGuild();
  if (db_guild.custom_slash_commands?.[interaction.data.name]) {
    const custom_command: custom_slash_commands =
      db_guild.custom_slash_commands[interaction.data.name];
    try {
      let text = await ParseFishyCode(
        custom_command.code || "BUH",
        interaction
      );
      if (text && typeof text == "string") {
        if (text.length > 1990) throw new Error("To long a response");
        else interaction.send(text);
      }
    } catch (err) {
      console.error(err);
      interaction.send(
        `This fishycode \`${custom_command.code}\` is invalid and cannot compile\nErr: \`${err}\``
      );
    }
  }
}

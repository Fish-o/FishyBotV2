import axios from "axios";
import { ClientEvents, VoiceState } from "discord.js";
import { FishyClient } from "fishy-bot-framework";
import { Interaction } from "fishy-bot-framework/lib/structures/Interaction";
import {
  raw_interaction,
  raw_received_interaction,
} from "fishy-bot-framework/lib/types";

export const trigger: keyof ClientEvents = "voiceStateUpdate";
export async function run(
  client: FishyClient,
  oldState: VoiceState,
  newState: VoiceState
) {
  if (!newState.channel?.parent) return;
  if (!newState.channel.name.startsWith("/")) return;
  if (newState.channel.parent.name !== "fishybot") return;

  const channel_name = newState.channel.name.toLocaleLowerCase().slice(1);
  const command_name = channel_name.split(" ").shift();

  if (!command_name || !client.commands.has(command_name)) return;

  //new Interaction(client);
}

import { MessageEmbed, Snowflake } from "discord.js";
import {
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";

const ConfirmCache = new Map<Snowflake, confirmCacheObject>();

export const confirmTime = 60 * 1000;
export interface confirmCacheObject {
  message?: string | MessageEmbed;
  timeEntered: number;
  timeOut: NodeJS.Timeout;
  promiseResolve: (value: boolean | PromiseLike<boolean>) => void;
}
export const run: FishyCommandCode = async (client, interaction) => {
  const member_id = interaction.user?.id;
  if (!member_id) return interaction.send("0344738274261465340404387");
  const data = ConfirmCache.get(member_id);

  if (data) {
    if (data.timeEntered + confirmTime < Date.now()) {
      data.promiseResolve(false);
      interaction.send(data.message || "You waited to long...");
      return ConfirmCache.delete(member_id);
    }
    clearTimeout(data.timeOut);
    data.promiseResolve(true);
    interaction.send(data.message || "Confirmed!");
  }
};

export async function awaitConfirm(
  member_id: string,
  message?: string | MessageEmbed
): Promise<boolean> {
  return new Promise((resolve) => {
    ConfirmCache.set(member_id, {
      message: message,
      timeEntered: Date.now(),
      timeOut: setTimeout(() => {
        resolve(false);
        ConfirmCache.delete(member_id);
        return;
      }, confirmTime),
      promiseResolve: resolve,
    });
  });
}

export const config: FishyCommandConfig = {
  name: "confirm",
  bot_needed: false,
  interaction_options: {
    name: "confirm",
    description: "Confirm a command",
  },
};

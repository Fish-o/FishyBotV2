import { ChannelLogsQueryOptions, Message } from "discord.js";
import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
  FishyCommandHelp,
} from "fishy-bot-framework/lib/types";
import ms from "ms";

// TODO: add user id search
// TODO: this needs testing
export const run: FishyCommandCode = async (client, interaction) => {
  const value_string = interaction.data.options.find(
    (option) => option.name === "amount"
  )?.value;
  if (!value_string || typeof value_string !== "number") {
    return interaction.sendSilent("SHIT BROKE, ABORT, ABORT!");
  }
  const value = value_string;
  const user_id = interaction.data.mentions?.users?.first();
  const after = interaction.data.options.find((o) => o.name === "after")?.value;
  const channel_id =
    interaction.data.mentions?.channels?.first()?.id || interaction.channel_id;
  const no_limit = interaction.data.options.find(
    (o) => o.name === "disablelimit"
  )?.value;

  if (!channel_id) {
    return interaction.sendSilent(">:( BAD!, UR BEING BAD!");
  }
  const channel = interaction.guild!.channels.cache.get(channel_id);

  if (!channel || channel.type !== "text" || !channel.isText()) {
    return interaction.sendSilent("The channel can only be a text channel");
  }

  const query: ChannelLogsQueryOptions = {
    limit: value,
  };
  if (value === 0) {
    return interaction.sendSilent("The limit cant be 0");
  }
  let doQuery = false;
  if (no_limit && typeof no_limit == "boolean") {
    doQuery = true;
  } else if (value >= 100) {
    return interaction.sendSilent(
      "The bot can only purge up to 99 messages at a time"
    );
  }

  if (after && typeof after == "string") {
    query.after = after;
    doQuery = true;
  }

  if (doQuery) {
    try {
      console.log(query);
      const messages = await channel.messages.fetch(query);
      if (!messages || !messages.first()) {
        return interaction.sendSilent("Could not fetch messages");
      }
      if (
        messages.last() &&
        messages.last()!.createdTimestamp + 13.5 * 24 * 60 * 60 * 1000 >
          Date.now()
      ) {
        const size = messages.size;
        const batch_size = 90;
        const parts = Math.floor(size / batch_size);
        const rest = size - parts * batch_size;
        const bulk_interval = 2000;
        interaction.sendSilent(
          `Started deleting messages, this will take about ${ms(
            bulk_interval * (parts + 1)
          )}`
        );
        if (rest && rest > 0) channel.bulkDelete(rest);
        for (let part = 0; part < parts; part++) {
          setTimeout(() => {
            channel.bulkDelete(batch_size);
          }, bulk_interval * (part + 1));
        }
      } else {
        const interval = 1150;
        messages
          .keyArray()
          .map((id) => messages.get(id))
          .filter((msg) => msg !== undefined)
          .forEach((message?: Message, index?: number) => {
            setTimeout(() => {
              message!.delete({
                reason: "Purged by " + interaction.member?.displayName,
              });
            }, index! * interval);
          });
        console.log(Object.values(messages));
        interaction.sendSilent(
          `Started deleting messages, this will take about ${ms(
            interval * messages.size
          )}`
        );
      }
    } catch (err) {
      interaction.sendSilent(` Something went wrong,:\n\`\`\`${err}\`\`\``);
    }
  } else {
    try {
      await channel.bulkDelete(value);
      interaction.sendSilent(`Succesfully removed ${value} messages!`);
    } catch (err) {
      interaction.sendSilent(
        `The bot can't purge message older then 14 days:\n\`\`\`${err}\`\`\``
      );
    }
  }
};

export const config: FishyCommandConfig = {
  name: "purge",
  bot_needed: true,
  bot_perms: ["MANAGE_MESSAGES"],
  user_perms: ["MANAGE_MESSAGES"],
  interaction_options: {
    name: "purge",
    description: "purge",
    options: [
      {
        name: "amount",
        description: "amount of messages to purge",
        type: ApplicationCommandOptionType.INTEGER,
        required: true,
      },
      {
        name: "channel",
        description: "the channel to purge the messages in",
        type: ApplicationCommandOptionType.CHANNEL,
      } /*
      {
        name: "member",
        description: "Purge the messages of a specific member",
        type: ApplicationCommandOptionType.USER,
      },*/,
      {
        name: "after",
        description: "(advanced) Purge messages after a specific message id",
        type: ApplicationCommandOptionType.INTEGER,
      },
      {
        name: "disablelimit",
        description:
          "(advanced) Disables the 99 message limit, this will make the purging take longer",
        type: ApplicationCommandOptionType.BOOLEAN,
      },
    ],
  },
};
export const help: FishyCommandHelp = {
  description: "Pong!?",
  usage: "/ping",
};

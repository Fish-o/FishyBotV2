//const Ssentry = require("@sentry/node");

import { Message, Role } from "discord.js";
import { FishyClient } from "fishy-bot-framework";

exports.run = async (client: FishyClient, message: Message, args: string[]) => {
  console.log(message.mentions);
  console.log(message.mentions.roles);
  if (message.mentions.roles.size <= 0) {
    return message.channel.send(
      "Please mention at least one role to be deleted"
    );
  }

  let msg = await message.channel.send(
    `Are you sure you want do **delete** \`${message.mentions.roles.size}\` roles?`
  );
  msg.react("✔️");
  msg.react("❌");
  let collected = await msg.awaitReactions(
    (reaction, emojiuser) =>
      emojiuser.id == message.author.id &&
      ["✔️", "❌"].includes(reaction.emoji.toString()),
    { max: 1, time: 30000 }
  );

  if (collected?.first()) {
    var emoji = collected.first()?.emoji.toString();

    if (emoji == "✔️") {
      msg.delete();
      let success: string[] = [];
      let failed: Role[] = [];
      await message.mentions.roles.forEach((role) => {
        try {
          let deleted_role = role.delete();
          success.push(role.name);
        } catch (err) {
          failed.push(role);
        }
      });
      if (!failed[0]) {
        return message.channel.send(
          `All roles successfully deleted! (_${success.join("_, _")}_) `
        );
      } else {
        return message.channel.send(
          `Not all roles were deleted.\n Roles deleted: _${success.join(
            "_, _"
          )}_ \nRoles failed: ${failed.join(", ")}`
        );
      }
    } else if (emoji == "❌") {
      return message.channel.send("Stopped");
    } else {
      return message.channel.send("Aborted");
    }
  } else {
    return message.channel.send("Stopped");
  }
};

exports.name = "removerole";

import {
  Permissions,
  PermissionOverwriteOption,
  Collection,
  MessageEmbed,
  TextChannel,
  Message,
  BitFieldResolvable,
} from "discord.js";
import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";
import ms from "ms";

export const mute_role_name = "Muted";
const overwrites: PermissionOverwriteOption = {
  SEND_MESSAGES: false,
  ADD_REACTIONS: false,
  SPEAK: false,
  CREATE_INSTANT_INVITE: false,
  ATTACH_FILES: false,
  EMBED_LINKS: false,
};

let time_cache = new Collection<string, number>();
const ttl = 12 * 60 * 60 * 1000;
export const run: FishyCommandCode = async (client, interaction) => {
  if (!interaction.guild) return;
  if (!Object.values(interaction.mentions?.members || {})[0]) {
    return interaction.send(new ErrorEmbed("Please enter a member to mute"));
  }
  const member = interaction.data.mentions?.members?.first();
  const user = interaction.data.mentions?.users?.first();
  if (!member || !user) return interaction.sendSilent("No user to mute found");
  const member_perms = new Permissions(Number.parseInt(member.permissions!));
  if (member_perms.has("MANAGE_MESSAGES") || !user) {
    return interaction.send(new ErrorEmbed("Unable to mute this member"));
  }
  let muterole = interaction.guild.roles.cache.find(
    (role) => role.name === mute_role_name
  )!;
  if (!muterole) {
    muterole = await interaction.guild.roles.create({
      data: {
        name: mute_role_name,
        color: "#707070",
      },
      reason: "Used for muting people",
    });
  }
  let new_member = await interaction.guild.members.fetch(user.id);
  new_member.roles.add(muterole);

  const time = interaction.args.find((arg) => arg.name == "time")?.value;
  if (typeof time !== "string")
    return interaction.sendSilent("Im to tired for this");
  const miliseconds = time ? ms(time) : undefined;
  const reason =
    interaction.args.find((arg) => arg.name == "reason")?.value ||
    "No reason provided";
  const embed = new MessageEmbed();
  embed.setTimestamp();
  embed.setDescription(
    `Muted: ${new_member}\nMuted by: ${interaction.member}\nTime: \`${
      time && miliseconds && miliseconds > 10 ? ms(miliseconds) : "Indefinitely"
    }\`\nReason: \`${reason}\``
  );
  embed.setTitle(`Succesfully muted member ${new_member.displayName}`);
  embed.setFooter(`/un mute member: ${new_member.displayName}`);
  interaction.send(embed);
  if (time && miliseconds && miliseconds > 10) {
    setTimeout(async () => {
      try {
        if (interaction.channel?.isText()) {
          let newer_member = await interaction.guild!.members.fetch(
            new_member.id
          );
          if (!newer_member.roles.cache.has(muterole.id)) {
            return interaction.channel.send(
              `Tried to unmute ${new_member}, but they already seem to be unmuted!`
            );
          }
          await newer_member.roles.remove(muterole);
          interaction.channel.send(
            `${new_member} has been unmuted, after being muted for ${ms(
              miliseconds || 0
            )} by ${interaction.member}`
          );
          // TODO: fix this
          // interaction.channel.send()
        }
      } catch (err) {
        if (interaction.channel?.isText()) {
          interaction.channel.send(
            new ErrorEmbed(
              `Failed to unmute ${new_member.displayName}!`,
              `Failed to unmute the member: ${new_member}, after being muted for ${ms(
                miliseconds || 0
              )}`
            )
          );
        }
      }
    }, miliseconds);
  }

  if (
    !time_cache.has(interaction.guild.id) ||
    time_cache.get(interaction.guild.id)! + ttl < Date.now()
  ) {
    time_cache.set(interaction.guild.id, Date.now());
    interaction.guild.channels.cache.forEach(async (channel, id) => {
      if (!channel.permissionsFor(muterole.id)) {
        await channel.updateOverwrite(muterole.id, overwrites);
      }
    });
  }
};

export const config: FishyCommandConfig = {
  name: "mute",
  bot_needed: true,
  user_perms: ["MANAGE_MESSAGES"],
  bot_perms: ["MANAGE_ROLES", "MANAGE_CHANNELS"],
  interaction_options: {
    name: "mute",
    description: "Mute a member from this server",
    options: [
      {
        name: "member",
        description: "The member to mute",
        type: ApplicationCommandOptionType.USER,
        required: true,
      },
      {
        name: "time",
        description: "The time to mute someone",
        type: ApplicationCommandOptionType.STRING,
      },
      {
        name: "reason",
        description: "The reason for muting someone",
        type: ApplicationCommandOptionType.STRING,
      },
    ],
  },
};

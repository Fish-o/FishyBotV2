import {
  Permissions,
  PermissionOverwriteOption,
  Collection,
  MessageEmbed,
  TextChannel,
  Message,
  BitFieldResolvable,
  User,
  GuildMember,
} from "discord.js";
import ButtonInteraction from "fishy-bot-framework/lib/structures/ButtonInteraction";
import { Interaction } from "fishy-bot-framework/lib/structures/Interaction";
import {
  ApplicationCommandOptionType,
  ComponentStyle,
  ComponentType,
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
export const muteMember = async (
  interaction: Interaction | ButtonInteraction,
  user_id: string,
  time: number | undefined
) => {
  if (!interaction.guild) return;
  let muteRole = interaction.guild.roles.cache.find(
    (role) => role.name === mute_role_name
  )!;
  if (!muteRole) {
    muteRole = await interaction.guild.roles.create({
      data: {
        name: mute_role_name,
        color: "#707070",
      },
      reason: "Used for muting people",
    });
  }
  let new_member = await interaction.guild.members.fetch(user_id);
  new_member.roles.add(muteRole);

  const reason =
    interaction.data.options.find((arg) => arg.name == "reason")?.value ||
    "No reason provided";
  const embed = new MessageEmbed();
  embed.setTimestamp();
  embed.setDescription(
    `Muted: ${new_member}\nMuted by: ${interaction.member}\nTime: \`${
      time && time > 10 ? ms(time) : "Indefinitely"
    }\`\nReason: \`${reason}\``
  );
  embed.setTitle(`Successfully muted member ${new_member.displayName}`);
  embed.setFooter(`/un mute member: ${new_member.displayName}`);
  interaction.send(embed, {
    components: [
      {
        components: [
          {
            type: ComponentType.Button,
            label: "Unmute",
            custom_id: `unmute_${new_member.id}`,
            style: ComponentStyle.Success,
          },
        ],
        type: ComponentType.ActionRow,
      },
    ],
  });
  if (time && time > 10) {
    setTimeout(async () => {
      unMuteMember(interaction, new_member.id, new_member, time, true);
    }, time);
  }

  if (
    !time_cache.has(interaction.guild.id) ||
    time_cache.get(interaction.guild.id)! + ttl < Date.now()
  ) {
    time_cache.set(interaction.guild.id, Date.now());
    interaction.guild.channels.cache.forEach(async (channel, id) => {
      if (!channel.permissionsFor(muteRole.id)) {
        await channel.updateOverwrite(muteRole.id, overwrites);
      }
    });
  }
};
export const unMuteMember = async (
  interaction: Interaction | ButtonInteraction,
  user_id: string,
  new_member?: GuildMember,
  time?: number,
  send_channel?: boolean
) => {
  if (!interaction.guild) return;
  new_member = new_member || (await interaction.guild.members.fetch(user_id));

  try {
    let muteRole = interaction.guild.roles.cache.find(
      (role) => role.name === mute_role_name
    );
    if (!muteRole) return;
    if (interaction.channel?.isText()) {
      let newer_member = await interaction.guild!.members.fetch(new_member.id);
      if (!newer_member.roles.cache.has(muteRole.id)) {
        return;
      }
      await newer_member.roles.remove(muteRole);
      if (send_channel) {
        interaction.channel.send(
          `${new_member} has been unmuted, after being muted for ${ms(
            time || 0
          )} by ${interaction.member}`
        );
      } else {
        interaction.send(
          new ErrorEmbed(
            `Successfully unmuted ${new_member.user.tag}!`
          ).setColor("GREEN")
        );
      }
    }
  } catch (err) {
    if (send_channel) {
      if (interaction.channel?.isText()) {
        interaction.channel.send(
          new ErrorEmbed(
            `Failed to unmute ${new_member.displayName}!`,
            `Failed to unmute the member: ${new_member}, after being muted for ${ms(
              time || 0
            )}`
          )
        );
      }
    } else {
      interaction.send(
        new ErrorEmbed(
          `Failed to unmute ${new_member.displayName}!`,
          `Failed to unmute the member: ${new_member}, after being muted for ${ms(
            time || 0
          )}`
        )
      );
    }
  }
};
export const run: FishyCommandCode = async (client, interaction) => {
  if (!interaction.guild) return;
  if (!interaction.mentions?.members?.keyArray()?.[0]) {
    return interaction.send(new ErrorEmbed("Please enter a member to mute"));
  }
  const member = interaction.data.mentions?.members?.first();
  const user = interaction.data.mentions?.users?.first();
  if (!member || !user) return interaction.sendSilent("No user to mute found");
  const member_perms = new Permissions(Number.parseInt(member.permissions!));
  if (member_perms.has("MANAGE_MESSAGES") || !user) {
    return interaction.send(new ErrorEmbed("Unable to mute this member"));
  }
  const rawTime = interaction.data.options.find(
    (arg) => arg.name == "time"
  )?.value;
  let time;
  if (typeof rawTime == "string") time = ms(rawTime);
  await muteMember(interaction, user.id, time);
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

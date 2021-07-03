import {
  ColorResolvable,
  Message,
  MessageEmbed,
  Role,
  RoleData,
  Snowflake,
} from "discord.js";
import {
  ApplicationCommandOptionType,
  channel_types,
  FishyCommandCode,
  FishyCommandConfig,
  role_object,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed, WarnEmbed } from "fishy-bot-framework/lib/utils/Embeds";
import ms from "ms";
import { awaitConfirm, confirmTime } from "../hidden/confirm";

export const run: FishyCommandCode = async (client, interaction) => {
  if (!interaction.guild) return;
  const main_util = interaction.data.options[0];
  const main_util_name = main_util?.name;
  if (main_util_name === "role") {
    const sub_util = main_util.options[0];
    const sub_util_name = sub_util?.name;
    if (sub_util_name === "delete") {
      interaction.send("Deleting roles...");
      const deleted_roles: Array<string> = [];
      const failed_roles: Array<string> = [];

      const enteredRole = interaction?.mentions?.roles?.first();
      const stringRoles = sub_util.options.find(
        (opt) => opt.name === "roles"
      )?.value;
      if (enteredRole) {
        const role = await interaction.guild.roles.fetch(
          enteredRole.id,
          true,
          true
        );
        if (role) {
          try {
            await role.delete(
              `Delete command called by: ${interaction.member?.user.tag}`
            );
            deleted_roles.push(enteredRole.name);
          } catch (err) {
            failed_roles.push(enteredRole.name);
          }
        } else {
          failed_roles.push(enteredRole.name);
        }
      } else if (stringRoles && typeof stringRoles === "string") {
        const res = [...stringRoles.matchAll(/(\d{18})/g)];
        await Promise.all(
          res.map(async (array) => {
            const role_id = array[array.length - 1];
            const role = await interaction.guild!.roles.fetch(role_id);
            if (role) {
              try {
                const name = role.name.toString();
                await role.delete();
                deleted_roles.push(name);
              } catch (err) {
                failed_roles.push(role.name);
              }
            } else {
              failed_roles.push(role_id);
            }
            return;
          })
        );
      } else {
        return interaction.edit(
          new ErrorEmbed(
            "Failed to delete roles",
            "You must provide a role or roles to delete"
          )
        );
      }
      const embed = new MessageEmbed().setTimestamp();
      if (deleted_roles[0] && !failed_roles[0]) {
        embed.setTitle("Successfully deleted all roles").setColor("GREEN");
        embed.setDescription(
          `Deleted roles:\n\`${deleted_roles.join("`, `")}\`\n`
        );
      } else if (deleted_roles[0] && failed_roles[0]) {
        embed.setTitle("Successfully deleted some roles").setColor("YELLOW");
        embed.setDescription(
          `Deleted roles:\n\`${deleted_roles.join("`, `")}\`\n`
        );
        embed.setDescription(
          `Failed roles:\n\`${failed_roles.join("`, `")}\`\n`
        );
      } else if (!deleted_roles[0] && failed_roles[0]) {
        embed.setTitle("Failed to delete roles").setColor("RED");
        embed.setDescription(
          `Failed roles:\n\`${failed_roles.join("`, `")}\`\n`
        );
      }
      interaction.edit(embed);
    } else if (sub_util_name === "create") {
      const name = sub_util.options.find((opt) => opt.name === "name")?.value;
      const color = sub_util.options.find((opt) => opt.name === "color")?.value;
      const raw = sub_util.options.find((opt) => opt.name === "raw")?.value;
      if ((name || color) && !raw) {
        const obj: RoleData = {
          position: 1,
          permissions: 0,
        };
        if (typeof name === "string") {
          obj.name = name;
        }
        if (typeof color === "string") {
          obj.color = colourNameToHex(color) || color;
        }

        const role = await interaction.guild.roles.create({
          data: obj,
          reason: `'/u role create' ran by: ${interaction.member?.user.tag}`,
        });
        const embed = new MessageEmbed()
          .setTitle("Successfully created a role!")
          .setColor("GREEN")
          .setTimestamp()
          .setDescription(`Created role: ${role}`);
        interaction.send(embed);
      } else if (raw && typeof raw === "string") {
        const rawRoles = raw.split(";");
        const failed: Array<string> = [];
        const created: Array<Role> = [];
        interaction.send(
          new MessageEmbed()
            .setTitle("Creating roles..")
            .setDescription("This might take some time :)")
            .setColor("YELLOW")
            .setTimestamp()
        );
        await Promise.all(
          rawRoles.map(async (rawRole, index) => {
            if (rawRole.trim() == "") return;
            rawRole = rawRole.trim();
            const splitRole = rawRole.split("|");
            if (!splitRole[0]) return failed.push(`1: \`${rawRole}\``);
            const obj: RoleData = {
              position: index + 1,
              permissions: 0,
            };
            obj.name = splitRole[0];
            if (splitRole[1]) {
              obj.color = colourNameToHex(splitRole[1]) || splitRole[1];
            }

            try {
              const role = await interaction.guild?.roles.create({
                data: obj,
                reason: `'/u role create' ran by: ${interaction.member?.user.tag}`,
              });
              if (role) created.push(role);
              else failed.push(`2: \`${rawRole}\``);
            } catch (err) {
              failed.push(`3: \`${rawRole}\``);
            }
            return;
          })
        );
        const embed = new MessageEmbed();
        if (!failed[0] && created[0]) {
          embed
            .setTitle("Successfully created all roles!")
            .setColor("GREEN")
            .setTimestamp()
            .setDescription(`Created roles: \n${created.join(", ")}`);
        } else if (failed[0] && created[0]) {
          embed
            .setTitle("Successfully created some roles")
            .setColor("YELLOW")
            .setTimestamp()
            .setDescription(
              `Created roles: \n${created.join(
                ", "
              )}\n\nFailed roles: \n${failed.join(",\n")}`
            );
        } else if (failed[0] && !created[0]) {
          embed
            .setTitle("Failed to create any role")
            .setColor("RED")
            .setTimestamp()
            .setDescription(`Failed roles: \n${failed.join(",\n")}`);
        }
        interaction.edit(embed);
      }
    } else if (sub_util_name === "clone") {
      const origin = interaction.data.mentions?.roles?.first();
      const name = sub_util.options.find((opt) => opt.name === "name")?.value;
      const color = sub_util.options.find((opt) => opt.name === "color")?.value;
      const assign = sub_util.options.find(
        (opt) => opt.name === "assign"
      )?.value;
      if (!origin)
        return interaction.send(
          new ErrorEmbed(
            "Failed to clone role",
            "You must provide a role to clone"
          )
        );
      const data: RoleData = {};
      if (typeof name === "string") data.name = name || `${origin.name} (copy)`;
      else data.name = `${origin.name} (copy)`;
      if (typeof color === "string")
        data.color = colourNameToHex(color) || color || origin.color;
      else data.color = origin.color;
      data.permissions = origin.permissions;
      data.mentionable = origin.mentionable;
      data.hoist = origin.hoist;
      data.position = origin.position;
      try {
        let role = await interaction.guild.roles.create({
          data: data,
          reason: `'/u role create' ran by: ${interaction.member?.user.tag}`,
        });
        if (!role) {
          delete data.position;
          role = await interaction.guild.roles.create({
            data: data,
            reason: `'/u role create' ran by: ${interaction.member?.user.tag}`,
          });
        }
        if (!role)
          return interaction.send(new ErrorEmbed("Failed to clone role"));
        const embed = new MessageEmbed()
          .setTitle("Successfully cloned the role!")
          .setTimestamp()
          .setColor("GREEN");
        let desc = `Successfully made the new role "${role}"\n`;

        if (typeof assign == "boolean" && assign === true) {
          const originRole = await interaction.guild.roles.fetch(origin.id)!;
          const members = originRole!.members;
          if (members.size > 2000) {
            desc += `**Didn't assign roles as it would take over ${ms(
              members.size * 205
            )}**`;
          } else {
            members.keyArray().forEach((member_id, index) => {
              setTimeout(() => {
                members.get(member_id)?.roles.add(role);
              }, index * 205);
            });

            desc += `Started applying the roles to server members, this can take up to ${ms(
              205 * members.size
            )}`;
          }

          //
        }
        embed.setDescription(desc);
        interaction.send(embed);
      } catch (err) {
        interaction.send(new ErrorEmbed("Couldn't clone the role: ", err));
      }
    } else if (sub_util_name === "delete-between") {
      const [role1, role2] = await Promise.all([
        interaction.guild.roles.fetch(
          interaction?.mentions?.roles?.first()?.id || "",
          undefined,
          true
        ),
        interaction.guild.roles.fetch(
          interaction?.mentions?.roles?.last()?.id || "",
          undefined,
          true
        ),
      ]);
      if (!role1 || !role2) {
        return interaction.send("One of the roles not found");
      } else if (role1.id === role2.id) {
        return interaction.send(new ErrorEmbed("The 2 roles cant be the same"));
      }

      let lowerbound: Role;
      let upperbound: Role;
      console.log(role1);
      console.log(role2);
      if (role1.position > role2.position) {
        lowerbound = role2;
        upperbound = role1;
      } else if (role1.position < role2.position) {
        lowerbound = role1;
        upperbound = role2;
      } else {
        return interaction.send(
          new ErrorEmbed("The two roles cant be the same")
        );
      }
      const guild_roles = await interaction.guild.roles.fetch(
        undefined,
        true,
        true
      );
      console.log(guild_roles.cache);
      const to_delete = guild_roles.cache.filter((element) => {
        console.log(element);
        console.log(element.position > lowerbound.position);
        console.log(element.position < upperbound.position);
        return (
          element.position > lowerbound.position &&
          element.position < upperbound.position
        );
      });
      const embed = new MessageEmbed()
        .setFooter("You have until")
        .setTimestamp(Date.now() + confirmTime)
        .setTitle(`Confirm deleting ${to_delete.size} roles`)
        .setDescription(
          `Run \`/confirm\` withing ${ms(
            confirmTime
          )} to confirm deleting these roles:\n${to_delete
            .map((role) => role.toString())
            .join(",\n")}\n` //This will take about ${ms(100)}`
        )
        .setColor("YELLOW");
      interaction.send(embed);
      const confirmed = await awaitConfirm(interaction.user?.id || "");
      if (!confirmed) {
        interaction.edit(
          new MessageEmbed()
            .setTimestamp(Date.now() + confirmTime)
            .setTitle(`Timed out, didn't delete ${to_delete.size} roles`)
            .setDescription(
              `Run this command again, and then run \`/confirm\` to delete these roles:\n${to_delete
                .map((role) => role.toString())
                .join(",\n")}`
            )
            .setColor("RED")
        );
      } else if (confirmed) {
        const failed: Array<Role> = [];
        const res = await Promise.all(
          // TODO: this is still buggy and still needs fixing but not by me :D
          to_delete
            .map((role) => role)
            .map(async (role) => {
              try {
                await role.delete(
                  '"/u role delete-between" ran by ' + interaction.user?.tag
                );
                return;
              } catch (err) {
                failed.push(role);
              }
              return;
            })
        );
        return interaction.edit(
          new MessageEmbed()
            .setTitle("Deleted the roles!")
            .setTimestamp()
            .setDescription(`Roles failed:\n${failed.join("\n, ") || "None!"}`)
            .setColor("GREEN")
        );
      }
    }
  } else if (main_util_name === "channel") {
    const sub_util = main_util.options[0];
    const sub_util_name = sub_util?.name;
    if (sub_util_name === "delete-category") {
      const category = interaction.data.mentions?.channels?.first();
      if (!category)
        return interaction.send("1387477777777738383019384585563764");
      else if (category.type === "category") {
        const guild_channels = interaction.guild.channels.cache.filter(
          (channel) => channel.parentID === category.id
        );
        if (!guild_channels || !guild_channels.first())
          return interaction.send(
            new ErrorEmbed("There are no channels in that category to delete")
          );
        interaction.send(
          new WarnEmbed(
            `Please confirm the deletion of ${guild_channels.size} channels`,
            `Run \`/confirm\` withing ${ms(
              confirmTime
            )} to confirm deleting these channels:\n${guild_channels
              .map((channel) => channel.toString())
              .join(",\n")}`
          )
        );
        const confirmed = await awaitConfirm(interaction.user?.id!);
        if (!confirmed) {
          return interaction.edit(
            new ErrorEmbed(
              `Canceled the deletion of ${guild_channels.size} channels`,
              `These channels did not get deleted:\n${guild_channels
                .map((channel) => channel.toString())
                .join(",\n")}`
            )
          );
        } else if (confirmed) {
          await Promise.all(
            guild_channels.map((channel) =>
              channel.delete(
                `"/u channel delete-category" ran by ${interaction.user?.tag}`
              )
            )
          );

          interaction.edit(
            new MessageEmbed()
              .setTitle(
                `Canceled the deletion of ${guild_channels.size} channels`
              )
              .setDescription(
                `These channels got deleted:\n\`${guild_channels
                  .map((channel) => channel.name)
                  .join("`,\n`")}\``
              )
              .setTimestamp()
              .setColor("GREEN")
          );
        }
      } else {
        return interaction.send(
          new ErrorEmbed(
            "Please enter a category",
            `<#${category.id}> is not a category`
          )
        );
      }
    }
  }
};

export const config: FishyCommandConfig = {
  name: "u",
  bot_needed: true,
  bot_perms: ["MANAGE_ROLES", "MANAGE_CHANNELS"],
  interaction_options: {
    name: "u",
    description:
      "Utility commands, basicity stuff you can already do in discord, but this makes it easier!",
    options: [
      {
        name: "role",
        user_perms: ["MANAGE_ROLES"],
        description: "Commands related to roles",
        type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
        options: [
          {
            name: "delete",
            description: "Delete a single, or multiple roles",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [
              {
                name: "role",
                description: "Delete a single role",
                type: ApplicationCommandOptionType.ROLE,
              },
              {
                name: "roles",
                description: "Delete multiple roles",
                type: ApplicationCommandOptionType.STRING,
              },
            ],
          },
          {
            name: "delete-between",
            description: "(UNSTABLE) Delete roles between two other roles",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            user_perms: ["ADMINISTRATOR"],
            options: [
              {
                name: "lowerbound",
                description: "The role to ",
                type: ApplicationCommandOptionType.ROLE,
                required: true,
              },
              {
                name: "upperbound",
                description: "Delete multiple roles",
                type: ApplicationCommandOptionType.ROLE,
                required: true,
              },
            ],
          },
          {
            name: "create",
            description: "Creates roles",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [
              {
                name: "name",
                description: "The name of the new role",
                type: ApplicationCommandOptionType.STRING,
              },
              {
                name: "color",
                description: "The color of the new role",
                type: ApplicationCommandOptionType.STRING,
              },
              {
                name: "raw",
                description:
                  "(advanced) name|color (optional);. Examples: admin|yellow; mod|blue",
                type: ApplicationCommandOptionType.STRING,
              },
            ],
          },
          {
            name: "clone",
            description: "Clone a role",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [
              {
                name: "origin",
                description: "The role to clone",
                type: ApplicationCommandOptionType.ROLE,
                required: true,
              },
              {
                name: "name",
                description: "The name of the new role",
                type: ApplicationCommandOptionType.STRING,
                required: true,
              },
              {
                name: "color",
                description: "The color of the new role",
                type: ApplicationCommandOptionType.STRING,
              },
              {
                name: "assign",
                description:
                  "Assign the new role to the people who have the clone",
                type: ApplicationCommandOptionType.BOOLEAN,
              },
            ],
          },
        ],
      },
      {
        name: "channel",
        description: "Util commands related to channels and categories",
        type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
        user_perms: ["MANAGE_CHANNELS"],
        options: [
          {
            name: "delete-category",
            description: "Delete a category and all its channels in it",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            user_perms: ["ADMINISTRATOR"],
            options: [
              {
                name: "category",
                description: "The category to delete",
                type: ApplicationCommandOptionType.CHANNEL,
                required: true,
              },
            ],
          },
        ],
      },
    ],
  },
};

function colourNameToHex(colour: string): ColorResolvable | undefined {
  const colours = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgrey: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370d8",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#d87093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32",
  };

  if (Object.keys(colours).includes(colour.toLowerCase().split(" ").join(""))) {
    return Object.values(colours)[
      Object.keys(colours).indexOf(colour.toLowerCase().split(" ").join(""))
    ];
  }
  if (/^#[0-9A-F]{6}$/i.test(colour)) return colour;
  return undefined;
}

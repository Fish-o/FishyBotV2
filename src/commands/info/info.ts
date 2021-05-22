import { Guild, MessageEmbed, Permissions, Role } from "discord.js";
import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
  role_object,
} from "fishy-bot-framework/lib/types";
import moment from "moment";
import Discord from "discord.js";
import QuickChart from "quickchart-js";
import ms from "ms";
const package_json = require("./../../../package.json");

const max_graph_item = 400;
export const run: FishyCommandCode = async (client, interaction) => {
  const action = interaction.data.options[0]?.name;

  if (action === "member") {
    if (!interaction.data.mentions?.users?.first())
      return interaction.sendSilent("You broke something >:(");
    if (!interaction.guild) return interaction.sendSilent("u smell");
    let user = interaction.data.mentions.users.first();
    let member = interaction.guild.members.cache.get(user?.id || "");
    if (!member)
      return interaction.sendSilent(
        "Couldn't find that member, did you maybe break something?!"
      );
    let notes = "";
    let permissions: Array<string> = [];
    {
      if (member.hasPermission("KICK_MEMBERS")) {
        permissions.push("Kick Members");
      }

      if (member.hasPermission("BAN_MEMBERS")) {
        permissions.push("Ban Members");
      }

      if (member.hasPermission("MANAGE_MESSAGES")) {
        permissions.push("Manage Messages");
      }

      if (member.hasPermission("MANAGE_CHANNELS")) {
        permissions.push("Manage Channels");
      }

      if (member.hasPermission("MENTION_EVERYONE")) {
        permissions.push("Mention Everyone");
        notes += `Can mention @everyone\n`;
      }

      if (member.hasPermission("MANAGE_NICKNAMES")) {
        permissions.push("Manage Nicknames");
      }

      if (member.hasPermission("MANAGE_ROLES")) {
        permissions.push("Manage Roles");
      }

      if (member.hasPermission("MANAGE_WEBHOOKS")) {
        permissions.push("Manage Webhooks");
      }

      if (member.hasPermission("MANAGE_EMOJIS")) {
        permissions.push("Manage Emojis");
      }

      if (member.hasPermission("ADMINISTRATOR")) {
        permissions = ["Administrator (everything)"];
        notes += `Has administrator permissions\n`;
      }

      if (permissions.length == 0) {
        permissions.push("No Key Permissions Found");
      }
    }
    if (member.user.id == interaction.guild.ownerID) {
      notes += "The Server Owner\n";
    }

    const embed = new MessageEmbed();
    embed.setTitle(`${member.user.tag} - Information`);
    embed.setDescription(`<@${member.user.id}>`);
    embed.setColor("RANDOM");
    embed.setFooter(`ID: ${member.id}`);
    embed.setThumbnail(member.user.displayAvatarURL());
    embed.addField(
      "Joined at: ",
      `${moment(member.joinedAt).format("dddd, MMMM Do YYYY, HH:mm:ss")}`,
      true
    );
    embed.setFooter(`${member.id} created at:`);
    embed.setTimestamp(member.user.createdAt);
    embed.addField("Permissions: ", `${permissions.join(", ")}`, true);
    embed.addField(
      `Roles`,
      `${
        member.roles.cache
          .filter((r) => r.id !== interaction.guild!.id)
          .map((roles) => `<@&${roles.id}>`)
          .join(" **|** ") || "No Roles"
      }`,
      true
    );
    embed.addField(`Notes`, notes || "I have nothing to note", true);
    interaction.send(embed);
    //.addField("Acknowledgements: ", `${warnings}`, true);
  } else if (action === "server") {
    console.time("Func");
    if (!interaction.guild) return interaction.send(">:()()()()()()()()()(:");
    try {
      let join_dates: Array<number> = [];
      const guild = interaction.guild; // await client.guilds.fetch('745332109706657972');
      const members = await guild.members.fetch();
      function checkBots() {
        let botCount = 0;
        members.forEach((member) => {
          if (member.user.bot) botCount++;
        });
        return botCount;
      }

      function checkMembers() {
        let memberCount = 0;
        members.forEach((member) => {
          if (member.joinedAt)
            join_dates.push(Number.parseInt(member.joinedAt.toISOString()));
          if (!member.user.bot) memberCount++;
        });
        return memberCount;
      }

      function checkOnlineUsers() {
        let onlineCount = 0;
        members.forEach((member) => {
          if (member.user.presence.status === "online") onlineCount++;
        });
        return onlineCount;
      }

      members.forEach((member) => {
        if (!member.user.bot) {
          join_dates.push(
            moment(
              moment.utc(member.joinedAt).format("DD/MM/YYYY"),
              "DD-MM-YYYY"
            ).unix()
          );
        }
      });
      join_dates.sort();
      let data = { [join_dates[0]]: 0 };
      let nice_data: { [key: string]: number } = {};

      let last_date = join_dates[0];
      join_dates.forEach((join_date) => {
        if (data[join_date]) {
          data[join_date] = data[join_date] + 1;
        } else {
          data[join_date] = data[last_date] + 1;

          //convert the unix time of the last to dd/mm/yyyy
          nice_data[moment.utc(last_date * 1000).format("YYYY/MM/DD")] =
            data[last_date];
        }
        last_date = join_date;
      });

      let nice_array: Array<{
        users: number;
        date: string;
        distance: number;
      }> = [];
      let proximitys: Array<number> = [];
      Object.keys(nice_data).forEach((date, index, array) => {
        let distance = -1;
        if (index !== 0 && index !== array.length - 1) {
          const location = Math.round(new Date(date).valueOf() / 1000);
          const distance_before =
            location - Math.round(new Date(array[index - 1]).valueOf() / 1000);

          const distance_after =
            Math.round(new Date(array[index + 1]).valueOf() / 1000) - location;
          distance = (distance_before ^ 2) + (distance_after ^ 2);
          proximitys.push(distance);
        }

        nice_array.push({
          users: nice_data[date],
          date: date,
          distance: distance,
        });
      });
      if (max_graph_item - nice_array.length < 0) {
        proximitys = proximitys.sort((a, b) => a - b);
        let toRemove = proximitys.slice(0, nice_array.length - max_graph_item);
        nice_array = nice_array.filter(
          (obj) => !toRemove.includes(obj.distance)
        );
      }

      //var canvas = createCanvas(600,400)//600, 400)
      //var ctx = canvas.getContext('2d')
      //console.log(JSON.stringify(ctx))
      const mychartOptions = {
        type: "line",

        data: {
          labels: nice_array.map((obj) => obj.date),
          datasets: [
            {
              label: "Members over time",
              //color: 'rgba(255, 255, 255, 1)',
              data: nice_array.map((obj) => obj.users),
              fill: true,
            },
          ],
        },
        options: {
          legend: {
            labels: {
              fontColor: "White",
            },
          },
          scales: {
            xAxes: [
              {
                type: "time",
                ticks: {
                  fontColor: "white",
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  fontColor: "white",
                },
              },
            ],
          },
        },
      };
      const chart = new QuickChart();
      chart
        .setConfig(mychartOptions)
        .setBackgroundColor("transparent")
        .setWidth(500)
        .setHeight(300)
        .setDevicePixelRatio(10);
      console.log(chart.getUrl().length);
      const url = await chart.getShortUrl();
      let sicon = interaction.guild.iconURL() || "";
      let serverembed = new Discord.MessageEmbed()
        .setTitle(`${interaction.guild.name} - Information`)
        .setColor("RANDOM")
        .addField("Server owner", interaction.guild.owner, true)
        .addField("Server region", interaction.guild.region, true)
        .setThumbnail(sicon)
        .addField("Server Name", interaction.guild.name)
        .addField(
          "Verification level",
          interaction.guild.verificationLevel,
          true
        )
        .addField("Channel count", interaction.guild.channels.cache.size, true)
        .addField("Total member count", interaction.guild.memberCount)
        .addField("Humans", checkMembers(), true)
        .addField("Bots", checkBots(), true)
        .addField("Online", checkOnlineUsers())

        .setFooter(`${interaction.guild.id} created at:`)
        .setTimestamp(interaction.guild.createdAt)
        .setImage(url);
      /*    if(IMAGE){
          serverembed.setImage(IAMGE)
      }*/
      console.timeEnd("Func");
      return interaction.send(serverembed);
    } catch (err) {
      //Sentry.captureException(err);
      console.error("An error has occurred with the serverinfo command");
      console.error(err);

      return interaction.sendSilent("Something has gone wrong!");
    }
  } else if (action === "bot") {
    const guild_size = client.guilds.cache.size;
    const channel_size = client.channels.cache.size;
    const users_size = client.users.cache.size;
    let serverembed = new Discord.MessageEmbed()
      .setColor("#9400D3")
      .setAuthor(client.fishy_options.author, client.user!.displayAvatarURL())
      .addField(`Version`, package_json?.version, true)
      //.addField(`Library`,`Discord.js` , true)
      .addField(`Creator`, `Fish`, true)
      .addField(`Servers`, `${guild_size}`, true)
      .addField(`channels`, `${channel_size}`, true)
      .addField(`Users`, `${users_size}`, true)
      .addField(
        `Invite`,
        `[Invite link!](https://discord.com/api/oauth2/authorize?client_id=${
          client.user!.id
        }&permissions=8&scope=bot%20applications.commands`,
        true
      )
      .setFooter(`Online since`)
      .setTimestamp(Date.now() - (client.uptime || 0));
    return interaction.send(serverembed);
  } else if (action === "role") {
    let value_role = interaction.data.mentions?.roles?.first();
    if (!value_role) {
      if (!interaction.member?.hasPermission("MANAGE_ROLES"))
        return interaction.sendSilent("You arent allowed to run this command");
      const guild_roles_manager = interaction.guild?.roles;
      if (!guild_roles_manager)
        return interaction.sendSilent("Couldnt fetch this servers roles");

      function compare(a: Role, b: Role) {
        if (a.position > b.position) {
          return -1;
        } else if (a.position < b.position) {
          return 1;
        } else {
          return 0;
        }
      }
      let text = "";
      const guild_roles = (await guild_roles_manager.fetch()).cache.array();
      guild_roles.sort(compare).forEach((role) => {
        let append = `${role.toString()} `;
        if (
          role.permissions.has("MENTION_EVERYONE") &&
          !role.permissions.has("ADMINISTRATOR") &&
          !role.permissions.has("MANAGE_MESSAGES") &&
          !role.permissions.has("MANAGE_CHANNELS")
        ) {
          append += `- ⚠️ Can Mention Everyone`;
        }
        text += append + "\n";
      });
      const Embed = new Discord.MessageEmbed()
        .setTitle(`Roles for ${interaction.guild!.name}`)
        .setColor("RANDOM")
        .setDescription(text);
      return interaction.send(Embed);
    } else {
      const Embed = new Discord.MessageEmbed()
        .setTitle(`Role: ${value_role.name}`)
        .setColor("RANDOM");
      if (
        new Permissions(Number.parseInt(value_role.permissions)).has(
          "ADMINISTRATOR"
        )
      ) {
        Embed.setDescription(`ADMINISTRATOR (everything)`);
      } else {
        Embed.setDescription(
          `${new Permissions(Number.parseInt(value_role.permissions))
            .toArray()
            .join("\n")}`
        );
      }
      return interaction.send(Embed);
    }
  }
};

export const config: FishyCommandConfig = {
  name: "info",
  bot_needed: true,
  interaction_options: {
    name: "info",
    description: "Get info about members, the server, the bot or roles!",
    options: [
      {
        name: "member",
        description: "Get info about a specific member",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "value",
            description: "The member to get info about",
            type: ApplicationCommandOptionType.USER,
            required: true,
          },
        ],
      },
      {
        name: "server",
        description: "Get info about the server",
        type: ApplicationCommandOptionType.SUB_COMMAND,
      },
      /*{
        name: "channel",
        description: "Get info about a specific channel",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "value",
            description: "The channel to get info about",
            type: ApplicationCommandOptionType.CHANNEL,
            required: true,
          },
        ],
      },*/
      {
        name: "bot",
        description: "Get info about the bot",
        type: ApplicationCommandOptionType.SUB_COMMAND,
      },
      {
        name: "role",
        description: "Get info about a specific role, or all of them",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "value",
            description: "The role to get info about",
            type: ApplicationCommandOptionType.ROLE,
          },
        ],
      },
    ],
  },
};

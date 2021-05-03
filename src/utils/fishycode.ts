import axios from "axios";
import { Interaction } from "fishy-bot-framework/lib/structures/Interaction";
import { InteractionDataOption } from "fishy-bot-framework/lib/structures/InteractionOptions";
import { ApplicationCommandCompare } from "fishy-bot-framework/lib/utils/ApplicationCommandCompare";
import {
  ApplicationCommand,
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  InteractionResponse,
  raw_interaction,
  raw_received_interaction,
} from "fishy-bot-framework/lib/types";

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

interface custom_member {
  mention: string;
  id: string;
  tag: string;
  displayname: string;
}
interface arg_interface {
  string: { [var_name: string]: string | undefined } | undefined;
  int: { [var_name: string]: number | undefined } | undefined;
  member: { [var_name: string]: custom_member | undefined } | undefined;
}

export interface custom_slash_commands {
  timestamp: number;
  name: string;
  description: string;
  options: Array<ApplicationCommandOption>;
  code?: string;
}

export function ParseFishyCode(code: string, interaction: Interaction): string {
  const interaction_options = interaction.raw_interaction;
  let ints: { [var_name: string]: number } | undefined = {};
  let strings: { [var_name: string]: string } | undefined = {};
  let members: { [var_name: string]: custom_member } | undefined = {};

  if (interaction_options.data?.options) {
    ints = Object.assign(
      {},
      ...interaction_options.data?.options
        .map((opt) => {
          if (typeof opt.value === "number") {
            return { [opt.name || "asdfasdf"]: opt.value || 0 };
          }
        })
        .filter((val) => !!val)
    );

    strings = Object.assign(
      {},
      ...interaction_options.data?.options
        .map((opt) => {
          if (
            typeof opt.value === "string" &&
            opt.type &&
            opt.type == ApplicationCommandOptionType.STRING
          ) {
            return { [opt.name || "asdfasdf"]: opt.value || "blank" };
          }
        })
        .filter((val) => !!val)
    );

    members = Object.assign(
      {},
      ...interaction_options.data?.options
        .map((opt) => {
          if (
            typeof opt.value === "string" &&
            opt.type &&
            opt.type == ApplicationCommandOptionType.USER
          ) {
            const interaction_member = interaction.data.mentions?.members?.get(
              opt.value
            );
            const interaction_user = interaction.data.mentions?.users?.get(
              opt.value
            );
            if (!interaction_member || !interaction_user) return undefined;
            const member_obj: custom_member = {
              id: opt.value,
              mention: `<@${opt.value}>`,
              tag: `${interaction_user.username}#${interaction_user.discriminator}`,
              displayname: `${
                interaction_member.nick || interaction_user.username
              }`,
            };
            return { [opt.name || "asdfasdf"]: member_obj };
          }
        })
        .filter((val) => !!val)
    );
  }

  const args: arg_interface = {
    int: ints || {},
    string: strings || {},
    member: members || {},
  };

  const types = ["int", "member", "str"];
  const vars_regexp = /{{\s*(int|str|member)_(.+?(?=}}))\s*/g;
  const func_regexp = /{{\s*(rand|choose)\((.+?(?=}}))\s*/g;
  const vars_matched = [...code.matchAll(vars_regexp)];
  let last_match = 0;

  // Inserting variables
  vars_matched.forEach((variable) => {
    let place = code.indexOf(variable[0], last_match);
    last_match = place + 3;
    let type = types.find((type) => variable[1] === type);
    let var_name = variable[2].trim();
    if (
      !type ||
      (type !== "int" && type !== "string" && type !== "member") ||
      !var_name ||
      typeof var_name !== "string"
    )
      return;
    let answer = "";
    if (type !== "member") {
      let type_obj = args[type];
      if (!type_obj) return;
      let found: undefined | string | number = type_obj[var_name];
      if (found) {
        console.log(found);
        if (typeof found !== "string") found = found.toString();
        answer = found;
      }
    } else {
      const member_obj = args[type]?.[var_name.split(".")[0]];
      if (!member_obj) answer = "this went wrong!";
      else if (!variable[2].trim().includes(".")) answer = member_obj.mention;
      else {
        let method = variable[2]
          .trim()
          .slice(variable[2].trim().indexOf(".") + 1);
        if (!Object.keys(member_obj).includes(method))
          answer = `\`method ${method} doesnt exist\``;
        else {
          // @ts-ignore
          answer = member_obj[method] || "welp";
        }
      }
    }
    code =
      code.slice(0, place) +
      answer +
      code.slice(place + variable[0].length + 2);
  });

  //
  const func_matched = [...code.matchAll(func_regexp)];
  func_matched.forEach((func) => {
    const raw_string = func[0];
    const method = func[1].trim();
    const args = func[2].trim().slice(0, func[2].trim().length - 1);
    const index = code.indexOf(raw_string) || func.index || 0;
    let answer = "";
    console.log("Args:");
    console.log(args);
    if (method === "rand") {
      let splitted = args.split("|");
      if (splitted.length !== 2) answer = "rand needs 2 arguments";
      else {
        try {
          const start_int = Number.parseInt(splitted[0].trim());
          const end_int = Number.parseInt(splitted[1].trim());
          answer = randomIntFromInterval(start_int, end_int).toString();
        } catch (err) {
          answer = "Failed to make random number";
        }
      }
    } else if (method === "choose") {
      let splitted = args.split("|");
      if (!splitted[1]) answer = splitted[0];
      else {
        answer = splitted[Math.floor(Math.random() * splitted.length)];
      }
    }
    code =
      code.slice(0, index) + answer + code.slice(index + raw_string.length + 2);
  });
  return code;
}

export async function ReloadSlashCommands(
  interaction: Interaction,
  name?: string // TODO: make name do somehting
) {
  //
  const GuildSlashCommandsUrl = `https://discord.com/api/v9/applications/${
    interaction.client.user!.id
  }/guilds/${interaction.guild_id}/commands`;

  const [response, db_guild] = await Promise.all([
    axios.get(GuildSlashCommandsUrl, {
      headers: { Authorization: `Bot ${interaction.client.token}` },
    }),
    interaction.getDbGuild(),
  ]);

  const discordSlashCommands: ApplicationCommand[] = response.data;
  let slash_commands_obj: { [name: string]: custom_slash_commands } =
    db_guild.custom_slash_commands;
  const botSlashCommands = Object.values(slash_commands_obj);

  if (!name) {
    let discord_done: Array<string> = [];
    await Promise.all(
      botSlashCommands.map((botSlashCommand, index) => {
        let discord_command = discordSlashCommands.find(
          (cmd) => cmd.name == botSlashCommand.name
        );
        if (!discord_command)
          return new Promise((resolve) => {
            setTimeout(() => {
              axios
                .post(GuildSlashCommandsUrl, botSlashCommand, {
                  headers: { Authorization: `Bot ${interaction.client.token}` },
                })
                .then((res) =>
                  resolve(
                    console.log(
                      `ccPOST - ${res.status} Interaction: "${botSlashCommand.name}", `
                    )
                  )
                )
                .catch((err) => {
                  resolve(console.error(err));
                });
            }, (21 / 5) * 1000 * index);
          });
        discord_done.push(discord_command.id!);
        if (!ApplicationCommandCompare(botSlashCommand, discord_command))
          return new Promise((resolve) => {
            setTimeout(() => {
              return axios
                .patch(
                  GuildSlashCommandsUrl + `/${discord_command!.id}`,
                  botSlashCommand,
                  {
                    headers: {
                      Authorization: `Bot ${interaction.client.token}`,
                    },
                  }
                )
                .then((res) =>
                  resolve(
                    console.log(
                      `ccPATCH - ${res.status} Interaction: "${botSlashCommand.name}", `
                    )
                  )
                )
                .catch((err) => {
                  resolve(console.error(err));
                });
            }, (21 / 5) * 1000 * index);
          });
      })
    );
    await Promise.all(
      discordSlashCommands.map((cmd, index) => {
        if (!discord_done.includes(cmd.id!)) {
          return new Promise((resolve) => {
            setTimeout(() => {
              axios
                .delete(GuildSlashCommandsUrl + `/${cmd.id}`, {
                  headers: { Authorization: `Bot ${interaction.client.token}` },
                })
                .then((res) =>
                  resolve(
                    console.log(
                      `ccDELETE - ${res.status} Interaction: "${cmd.name}", `
                    )
                  )
                )
                .catch((err) => {
                  resolve(console.error(err));
                });
            }, (21 / 5) * 1000 * index);
          });
        }
      })
    );
  }
}

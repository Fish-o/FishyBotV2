import { timeStamp } from "console";
import {
  ApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";
import moment from "moment-timezone";
const timezones: ApplicationCommandOptionChoice[] = [
  {
    name: "(AEST) Australia Eastern Standard Time",
    value: "Australia/Brisbane",
  },
  {
    name: "(ACST) Australia Central Standard Time",
    value: "Australia/Adelaide",
  },
  { name: "(AFT)  Afghanistan Time", value: "Asia/Tehran" },
  { name: "(MSK)  Moscow Standard Time", value: "Europe/Moscow" },
  { name: "(EAT)  East Africa Time", value: "Africa/Nairobi" },
  { name: "(CAT)  Central Africa Time", value: "Africa/Cairo" },
  { name: "(EET)  Eastern European Time", value: "Europe/Sofia" },
  { name: "(CET)  Central European Time", value: "Europe/Paris" },
  { name: "(WAT)  West Africa Time", value: "Africa/Algiers" },
  { name: "(WET)  Western European Time", value: "Europe/Lisbon" },
  { name: "(GMT)  Greenwich Mean Time", value: "Europe/London" },
  { name: "(UTC)  Coordinated Universal Time", value: "Etc/UTC" },
  { name: "(AST)  Atlantic Standard Time", value: "America/Blanc-Sablon" },
  { name: "(EST)  Eastern Standard Time", value: "America/New_York" },
  { name: "(CST)  Central Standard Time", value: "America/Regina" },
  { name: "(MST)  Mountain Standard Time", value: "America/Whitehorse" },
  { name: "(PST)  Pacific Standard Time", value: "America/Los_Angeles" },
  { name: "(AKST) Alaska Standard Time", value: "America/Anchorage" },
];

const styles: ApplicationCommandOptionChoice[] = [
  { name: "Relative Time", value: "R" },
  { name: "Short Time", value: "t" },
  { name: "Long Time", value: "T" },
  { name: "Short Date", value: "d" },
  { name: "Long Date", value: "D" },
  { name: "Short Date/Time", value: "f" },
  { name: "Long Date/Time", value: "F" },
];
export const run: FishyCommandCode = async (client, interaction) => {
  const opts = interaction.data.options;

  const time = opts.find((opt) => opt.name === "time")!.value;
  const timezone = opts.find((opt) => opt.name === "timezone")!.value;
  const style = opts.find((opt) => opt.name === "style")?.value || "t";

  const raw = opts.find((opt) => opt.name === "raw")?.value || false;
  const daylight_savings =
    opts.find((opt) => opt.name === "daylight-savings")?.value || false;

  if (
    typeof time !== "string" ||
    typeof timezone !== "string" ||
    typeof style !== "string" ||
    typeof raw !== "boolean" ||
    (typeof daylight_savings !== "boolean" && daylight_savings)
  )
    return interaction.send(
      new ErrorEmbed("09u23inmads0j0infd90h390hjfai0j0i3j0iajfdijdfoaijksdf")
    );

  const RawTimeParts = time
    .trim()
    .toLowerCase()
    .split(/[-\/:]/)
    .map((part) => part.toLowerCase().trim());

  const TimeParts: [number, number, number] = [0, 0, 0];
  for (const [index, RawPart] of RawTimeParts.entries()) {
    if (isNaN(+RawPart)) {
      return interaction.sendSilent(
        new ErrorEmbed(
          "Invalid time",
          `The time part \`${RawPart}\` of \`${RawTimeParts}\` is not a number.\nUse hh:mm or hh:mm:ss`
        )
      );
    }
    if (index > 2)
      return interaction.send(
        new ErrorEmbed(
          "Invalid time",
          `The time part \`${RawPart}\` of \`${RawTimeParts}\` is unneeded.\nUse hh:mm or hh:mm:ss`
        )
      );
    if (+RawPart > 60) {
      return interaction.sendSilent(
        new ErrorEmbed(
          "Invalid time",
          `The time part \`${RawPart}\` of \`${RawTimeParts}\` is above 60.\nUse hh:mm or hh:mm:ss`
        )
      );
    }
    TimeParts[index] = +RawPart;
  }
  if (TimeParts[0] > 24) {
    return interaction.sendSilent(
      new ErrorEmbed(
        "Invalid time",
        `The hours \`${TimeParts[0]}\` of \`${RawTimeParts}\` is above 24.\nUse hh:mm or hh:mm:ss`
      )
    );
  }
  const d = new Date();
  let timestamp = moment
    .tz(
      { hour: TimeParts[0], minute: TimeParts[1], second: TimeParts[2] },
      timezone
    )
    .unix();
  //console.log(timestamp);
  //console.log(d.getTimezoneOffset());
  //timestamp += d.getTimezoneOffset();
  //console.log(d.getTimezoneOffset());

  // if (timezone[0] == "+") {
  //   let offset = +timezone.substring(1);
  //   if (isNaN(offset))
  //     return interaction.sendSilent(
  //       new ErrorEmbed("Invalid timezone", `The timezone +${offset} is invalid`)
  //     );
  //   console.log(offset);
  //   timestamp -= offset * 60 * 60;
  // } else if (timezone[0] == "-") {
  //   let offset = +timezone.substring(1);
  //   if (isNaN(offset))
  //     return interaction.sendSilent(
  //       new ErrorEmbed("Invalid timezone", `The timezone -${offset} is invalid`)
  //     );
  //   console.log(offset);

  //   timestamp += offset * 60 * 60;
  // }
  // if (daylight_savings) {
  //   timestamp += 1 * 60 * 60;
  // }

  if (timestamp < Math.floor(Date.now() / 1000)) timestamp += 24 * 60 * 60;

  const text = `<t:${timestamp}:${style}>`;
  if (raw) interaction.sendSilent(`\`${text}\``);
  else interaction.send(`${text}`);
};

export const config: FishyCommandConfig = {
  name: "time",
  bot_needed: false,
  interaction_options: {
    name: "time",
    description: "Time zone utilities!",
    options: [
      {
        name: "time",
        description: "The time in hh:mm(:ss)",
        type: ApplicationCommandOptionType.STRING,
        required: true,
      },
      {
        name: "timezone",
        description: "Select your timezone",
        type: ApplicationCommandOptionType.STRING,
        required: true,
        choices: timezones,
      },
      {
        name: "style",
        description: "The style of the time",
        type: ApplicationCommandOptionType.STRING,
        required: false,
        choices: styles,
      },
      {
        name: "raw",
        description: "Give the raw string to use yourself",
        type: ApplicationCommandOptionType.BOOLEAN,
        required: false,
      },
    ],
  },
};

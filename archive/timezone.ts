import { MessageEmbed } from "discord.js";
import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";
import moment from "moment";
import * as cityTimeZones from "city-timezones";
import * as momentTZ from "moment-timezone";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";
import ms from "ms";

export const run: FishyCommandCode = async (client, interaction) => {
  const fromTime = interaction.data.options.find((opt) => opt.name === "time")
    ?.value;
  const fromTimezone = interaction.data.options.find(
    (opt) => opt.name === "timezone"
  )?.value;
  if (typeof fromTime !== "string") return interaction.send("8930505066243662");
  if (typeof fromTimezone !== "string") return interaction.send("809992243662");

  let time;
  try {
    let time1 = new Date(fromTime);
    time = time1?.valueOf() + new Date().getTimezoneOffset();
  } catch (err) {}
  if (!time) {
    console.log("2");
    try {
      time = Date.now() + ms(fromTime) + new Date().getTimezoneOffset();
    } catch (err) {}
  }
  if (!time) return interaction.send(new ErrorEmbed("Couldn't parse the time"));

  let timezoneOffset;
  try {
    timezoneOffset =
      getNormalizedUtcOffset(fromTimezone) ||
      getUtcOffsetForLocation(fromTimezone);
  } catch (err) {
    return interaction.send(new ErrorEmbed("Couldn't parse the timezone"));
  }
  if (timezoneOffset === null || timezoneOffset === undefined)
    return interaction.send(
      new ErrorEmbed(`Couldn't find a timezone with the name '${fromTimezone}'`)
    );
  const realTimezoneOffset =
    typeof timezoneOffset === "number" ? timezoneOffset : timezoneOffset[0];
  const embed = new MessageEmbed()
    .setDescription(`Entered: \`${fromTime}\``)
    .setFooter(
      `Is this in your time: ${
        typeof timezoneOffset == "number"
          ? ``
          : `\nUsing timezone offset: ${realTimezoneOffset}`
      }`
    )
    .setTimestamp(time + realTimezoneOffset);

  interaction.send(embed);
};

export const config: FishyCommandConfig = {
  name: "timezone",
  bot_needed: false,
  interaction_options: {
    name: "timezone",
    description: "Convert times between timezones",
    options: [
      {
        required: true,
        name: "time",
        description: "The time to convert",
        type: ApplicationCommandOptionType.STRING,
      },
      {
        required: true,
        name: "timezone",
        description: "The timezone of the time",
        type: ApplicationCommandOptionType.STRING,
      },
    ],
  },
};

/**
 * Returns the UTC offset for the given timezone
 * @param timezone Example: America/New_York
 */
export function getNormalizedUtcOffset(timezone: string): number | null {
  const momentTimezone = momentTZ.tz(timezone);
  if (!momentTimezone) {
    return null;
  }
  let offset = momentTimezone.utcOffset();
  if (momentTimezone.isDST()) {
    // utcOffset will return the offset normalized by DST. If the location
    // is in daylight saving time now, it will be adjusted for that. This is
    // a NAIVE attempt to normalize that by going back 1 hour
    offset -= 60;
  }
  return offset / 60;
}

/**
 * Returns the offset range for the given city or region
 * @param location
 */
export function getUtcOffsetForLocation(location: string): number[] | null {
  const timezones = cityTimeZones.findFromCityStateProvince(location);
  if (timezones && timezones.length) {
    // timezones will contain an array of all timezones for all cities inside
    // the given location. For example, if location is a country, this will contain
    // all timezones of all cities inside the country.
    // YOU SHOULD CACHE THE RESULT OF THIS FUNCTION.
    const offsetSet = new Set<number>();
    for (let timezone of timezones) {
      const offset = getNormalizedUtcOffset(timezone.timezone);
      if (offset !== null) {
        offsetSet.add(offset);
      }
    }

    return [...offsetSet].sort((a, b) => a - b);
  }
  return null;
}

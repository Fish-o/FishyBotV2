import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";
import axios from "axios";
import { Collection, MessageEmbed } from "discord.js";
import { parseName } from "../../utils";
import IgniteOverride from "../../models/IgniteOverride";

const ttl = 1 * 60 * 60 * 1000;
let cache: Collection<
  string,
  { timestamp: number; player: IgnitePlayer }
> = new Collection();

const overrides = {
  data: new Map<string, Map<string, string>>(),
  timestamp: 0,
};

export const run: FishyCommandCode = async (Client, Interaction) => {
  let oculus_name = Interaction.data.options.find((arg) => arg.name == "name")
    ?.value;
  if (!oculus_name) {
    let err = new ErrorEmbed("Please enter a name");
    Interaction.send(err);
    return;
  }

  let user_stats: IgnitePlayer | undefined | null = null;
  // Find in cache
  if (typeof oculus_name !== "string") return Interaction.sendSilent("Buh");
  if (
    !cache.has(oculus_name) ||
    (cache.has(oculus_name) &&
      cache.get(oculus_name)!.timestamp + ttl <= Date.now())
  ) {
    const endpoint = `https://ignitevr.gg/cgi-bin/EchoStats.cgi/get_player_stats?player_name=${oculus_name}&fuzzy_search=true`;
    let res = await axios.get(endpoint, {
      headers: {
        "x-api-key": process.env.IGNITE_KEY,
        useragent: "FishyBot V2",
      },
    });
    if (!res?.data)
      return Interaction.send(
        new ErrorEmbed(
          "Something has gone wrong",
          `The ignite api didnt respond with any data\nResponse code: ${res.status}`
        )
      );
    const ignite_data: IgniteResponse = res.data;

    if (!ignite_data.player?.[0])
      return Interaction.send(
        new ErrorEmbed(
          "No player found",
          `The ignite api couldnt find any players with the name: \`${oculus_name}\``
        )
      );
    let old_oculus_name = oculus_name;
    oculus_name = ignite_data.player[0].player_name || oculus_name;
    user_stats = ignite_data.player[0];

    // Save to cache
    cache.set(oculus_name, { timestamp: Date.now(), player: user_stats });
    if (old_oculus_name !== oculus_name)
      cache.set(old_oculus_name, { timestamp: Date.now(), player: user_stats });
  } else {
    user_stats = cache.get(oculus_name)!.player!;
    oculus_name = user_stats!.player_name || oculus_name;
  }

  /*
{
    "player": [
        {
            "game_count": 359,
            "inverted_time": 1051.12,
            "level": 50,
            "opt_in": 0,
            "opt_out": 0,
            "play_time": 69639.6,
            "player_id": 3175124852507881,
            "player_name": "Hamburber-",
            "player_number": 36,
            "possession_time": 11013.2,
            "profile_image": null,
            "profile_page": null,
            "total_2_pointers": 221,
            "total_3_pointers": 52,
            "total_assists": 132,
            "total_blocks": 0,
            "total_catches": 273,
            "total_goals": 273,
            "total_interceptions": 50,
            "total_passes": 68,
            "total_points": 851,
            "total_saves": 187,
            "total_shots_taken": 811,
            "total_steals": 87,
            "total_stuns": 1617,
            "total_wins": 157  */

  if (!user_stats) {
    return;
  }
  let nicenes: number = Math.round(
    (user_stats!.play_time / (user_stats.possession_time || 1)) *
      10 *
      ((user_stats.game_count * 2) / (user_stats.total_stuns || 1)) *
      (user_stats.total_2_pointers / ((user_stats.total_3_pointers || 1) * 4)) *
      ((user_stats.total_saves +
        user_stats.total_passes +
        user_stats.total_catches) /
        (user_stats.total_shots_taken || 1)) *
      100
  );

  if (overrides.timestamp + 5 * 60 * 1000 < Date.now()) {
    overrides.timestamp = Date.now();
    IgniteOverride.find({}, async (err, res) => {
      if (err) return;
      const MAP = new Map<string, Map<string, string>>();
      res.forEach((override: any) => {
        const username: string = override.username;
        const useroverrides: Map<string, string> = override.stats;
        MAP.set(override.username, useroverrides);
      });
      overrides.data = MAP;
    });
  }
  let custom_niceness;
  if (overrides.data.has(oculus_name)) {
    const current_overrides = overrides.data.get(oculus_name)!;
    for (let key of current_overrides.keys()) {
      // @ts-ignore
      user_stats[key] = current_overrides.get(key);
      if (key === "niceness") {
        custom_niceness = current_overrides.get(key);
      }
    }
  }
  let embed = new MessageEmbed()
    .setAuthor(
      "Powered by IgniteVR Metrics",
      "https://ignitevr.gg/wp-content/uploads/2019/09/primary_Optimized.png",
      `https://ignitevr.gg/stats/player/${oculus_name}`
    )
    .setColor("#0055ff")
    .setTitle(`IgniteVR stats for: ${parseName(oculus_name)}`)
    .setFooter(
      `Data is only collected from games when the \`ignitevr\` bot spectates a match`
    )
    .addFields(
      { name: "Games on record", value: user_stats.game_count, inline: true },
      { name: "Level", value: user_stats.level, inline: true },
      {
        name: "Win Ratio",
        value: `${Math.round(
          (user_stats.total_wins / user_stats.game_count) * 100
        )}%`,
        inline: true,
      },
      {
        name: "Goals Avg",
        value:
          Math.round((user_stats.total_goals / user_stats.game_count) * 100) /
          100,
        inline: true,
      },
      {
        name: "Hit Ratio",
        value: `${Math.round(
          (user_stats.total_goals / user_stats.total_shots_taken) * 100
        )}%`,
        inline: true,
      },
      {
        name: "3 Pointer Ratio",
        value: `${Math.round(
          (user_stats.total_3_pointers / user_stats.total_2_pointers) * 100
        )}%`,
        inline: true,
      },

      {
        name: "Assists Avg",
        value:
          Math.round((user_stats.total_assists / user_stats.game_count) * 100) /
          100,
        inline: true,
      },
      {
        name: "Saves Avg",
        value:
          Math.round((user_stats.total_saves / user_stats.game_count) * 100) /
          100,
        inline: true,
      },
      {
        name: "Stuns Avg",
        value:
          Math.round((user_stats.total_stuns / user_stats.game_count) * 100) /
          100,
        inline: true,
      },

      {
        name: "FishyBot's Niceness Generator™",
        value: custom_niceness || `Score: ${nicenes}`,
      }
    );

  Interaction.send(embed);
};

export const config: FishyCommandConfig = {
  name: "echostats",
  bot_needed: false,
  interaction_options: {
    name: "echostats",
    description: "Returns the echo ignite stats of a specific user",
    options: [
      {
        name: "name",
        description: "The user of who to find the stats for",
        type: ApplicationCommandOptionType.STRING,
        required: true,
      },
    ],
  },
};

export interface IgniteResponse {
  player?: Array<IgnitePlayer>;
  vrml_player?: Array<any>;
}

export interface IgnitePlayer {
  game_count: number;
  inverted_time: number;
  level: number;
  opt_in: 0 | 1;
  opt_out: 0 | 1;
  play_time: number;
  player_id: number;
  player_name: string;
  player_number: number;
  possession_time: number;
  profile_image: any;
  profile_page: any;
  total_2_pointers: number;
  total_3_pointers: number;
  total_assists: number;
  total_blocks: number;
  total_catches: number;
  total_goals: number;
  total_interceptions: number;
  total_passes: number;
  total_points: number;
  total_saves: number;
  total_shots_taken: number;
  total_steals: number;
  total_stuns: number;
  total_wins: number;
}

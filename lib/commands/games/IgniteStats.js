"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.config = exports.run = void 0;
const types_1 = require("fishy-bot-framework/lib/types");
const Embeds_1 = require("fishy-bot-framework/lib/utils/Embeds");
const axios_1 = __importDefault(require("axios"));
const discord_js_1 = require("discord.js");
const ttl = 1 * 60 * 60 * 1000;
let cache = new discord_js_1.Collection();
// @ts-ignore
exports.run = async (Client, Interaction) => {
    let oculus_name = Interaction.args.find((arg) => arg.name == "name")?.value;
    console.log(Interaction.args);
    console.log(oculus_name);
    if (!oculus_name) {
        let err = new Embeds_1.ErrorEmbed("Please enter a name");
        Interaction.send(err);
        return;
    }
    let user_stats = null;
    // Find in cache
    if (!cache.has(oculus_name) ||
        (cache.has(oculus_name) &&
            cache.get(oculus_name).timestamp + ttl <= Date.now())) {
        const endpoint = `https://ignitevr.gg/cgi-bin/EchoStats.cgi/get_player_stats?player_name=${oculus_name}&fuzzy_search=true`;
        let res = await axios_1.default.get(endpoint, {
            headers: {
                "x-api-key": process.env.IGNITE_KEY,
                useragent: "FishyBot V2",
            },
        });
        if (!res?.data)
            return Interaction.send(new Embeds_1.ErrorEmbed("Something has gone wrong", `The ignite api didnt respond with any data\nResponse code: ${res.status}`));
        const ignite_data = res.data;
        if (!ignite_data.player?.[0])
            return Interaction.send(new Embeds_1.ErrorEmbed("No player found", `The ignite api couldnt find any players with the name: \`${oculus_name}\``));
        let old_oculus_name = oculus_name;
        oculus_name = ignite_data.player[0].player_name || oculus_name;
        user_stats = ignite_data.player[0];
        // Save to cache
        cache.set(oculus_name, { timestamp: Date.now(), player: user_stats });
        if (old_oculus_name !== oculus_name)
            cache.set(old_oculus_name, { timestamp: Date.now(), player: user_stats });
    }
    else {
        user_stats = cache.get(oculus_name).player;
        oculus_name = user_stats.player_name || oculus_name;
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
    let nicenes = Math.round((user_stats.play_time / (user_stats.possession_time || 1)) *
        10 *
        ((user_stats.game_count * 2) / (user_stats.total_stuns || 1)) *
        (user_stats.total_2_pointers / ((user_stats.total_3_pointers || 1) * 4)) *
        ((user_stats.total_saves +
            user_stats.total_passes +
            user_stats.total_catches) /
            (user_stats.total_shots_taken || 1)) *
        100);
    let embed = new discord_js_1.MessageEmbed()
        .setAuthor("Powered by IgniteVR Metrics", "https://ignitevr.gg/wp-content/uploads/2019/09/primary_Optimized.png", `https://ignitevr.gg/stats/player/${oculus_name}`)
        .setColor("#0055ff")
        .setTitle(`IgniteVR stats for: ${oculus_name}`)
        .setFooter(`Data is only collected from games when the \`ignitevr\` bot spectates a match`)
        .addFields({ name: "Games on record", value: user_stats.game_count, inline: true }, { name: "Level", value: user_stats.level, inline: true }, {
        name: "Win Ratio",
        value: `${Math.round((user_stats.total_wins / user_stats.game_count) * 100)}%`,
        inline: true,
    }, {
        name: "Goals Avg",
        value: Math.round((user_stats.total_goals / user_stats.game_count) * 100) /
            100,
        inline: true,
    }, {
        name: "Hit Ratio",
        value: `${Math.round((user_stats.total_goals / user_stats.total_shots_taken) * 100)}%`,
        inline: true,
    }, {
        name: "3 Pointer Ratio",
        value: `${Math.round((user_stats.total_3_pointers / user_stats.total_2_pointers) * 100)}%`,
        inline: true,
    }, {
        name: "Assists Avg",
        value: Math.round((user_stats.total_assists / user_stats.game_count) * 100) /
            100,
        inline: true,
    }, {
        name: "Saves Avg",
        value: Math.round((user_stats.total_saves / user_stats.game_count) * 100) /
            100,
        inline: true,
    }, {
        name: "Stuns Avg",
        value: Math.round((user_stats.total_stuns / user_stats.game_count) * 100) /
            100,
        inline: true,
    }, { name: "Niceness™", value: `Score: ${nicenes}` });
    Interaction.send(embed);
};
exports.config = {
    name: "echostats",
    bot_needed: false,
    interaction_options: {
        name: "echostats",
        description: "Returns the echo ignite stats of a specific user",
        options: [
            {
                name: "name",
                description: "The user of who to find the stats for",
                type: types_1.ApplicationCommandOptionType.STRING,
                required: true,
            },
        ],
    },
};
exports.help = {
    usage: "/echostats name: OculusNameHere",
    description: exports.config.interaction_options.description,
};

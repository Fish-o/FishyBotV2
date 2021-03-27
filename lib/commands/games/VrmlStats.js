"use strict";
// TODO: Add a view for upcomming matches
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.config = exports.run = void 0;
const fuse_js_1 = __importDefault(require("fuse.js"));
const discord_js_1 = require("discord.js");
const types_1 = require("fishy-bot-framework/lib/types");
const axios_1 = __importDefault(require("axios"));
const Embeds_1 = require("fishy-bot-framework/lib/utils/Embeds");
const request_cache = new discord_js_1.Collection();
function request(url, ttl) {
    return new Promise(async (resolve, reject) => {
        async function refresh() {
            let res = await axios_1.default.get(url);
            if (!res || !res.status || !res.data) {
                console.error("Made request with bad response: \n" + url);
                console.error(res.status);
                console.error(res.config);
            }
            let obj = {
                timestamp: Date.now(),
                ttl: ttl || 60 * 1000,
                data: res.data,
            };
            request_cache.set(url, obj);
            return res.data;
        }
        if (request_cache.has(url)) {
            const cached_request = request_cache.get(url);
            if (cached_request.timestamp + cached_request.ttl < Date.now()) {
                return resolve(await refresh());
            }
            else if (cached_request.timestamp + cached_request.ttl / 4 <
                Date.now()) {
                resolve(cached_request.data);
                return refresh();
            }
            else {
                resolve(cached_request.data);
            }
        }
        else {
            return resolve(refresh());
        }
    });
}
const url_all_teams = `https://vrmasterleague.com/Services.asmx/GetTeamPlayersStats?game=echoarena&activeOnly=true&includeRetired=false`;
const url_stats_team = `https://vrmasterleague.com/Services.asmx/GetTeamStats?game=echoarena&teamName=`;
const logo_url = `https://vrmasterleague.com/Services.asmx/GetTeamLogo?game=echoarena&teamName=`;
exports.run = async function (client, interaction) {
    let msg_sent = false;
    let team_name = interaction.args.find((arg) => arg.name === "name")?.value;
    if (!team_name) {
        let emb = new Embeds_1.ErrorEmbed("Please enter a vrml team name");
        return msg_sent ? interaction.edit(emb) : interaction.send(emb);
    }
    if (!request_cache.has(url_all_teams) ||
        request_cache.get(url_all_teams).timestamp +
            request_cache.get(url_all_teams).ttl <
            Date.now()) {
        interaction.send("This can take a few seconds...");
        msg_sent = true;
    }
    const all_teams = await request(url_all_teams, 48 * 60 * 60 * 1000);
    const filtered_all_teams = all_teams.map((team) => {
        let obj = {
            name: team.name,
            players: team.players.map((player) => {
                let obj2 = {
                    name: player.name,
                    role: player.role,
                };
                return obj2;
            }),
        };
        return obj;
    });
    const name_fuse_options = {
        includeScore: true,
        isCaseSensitive: false,
        keys: [
            {
                name: "name",
                weight: 1,
            },
        ],
        distance: 5,
    };
    const player_fuse_options = {
        includeScore: true,
        isCaseSensitive: false,
        keys: [
            {
                name: "players.name",
                weight: 1,
            },
        ],
        distance: 5,
    };
    const name_fuse = new fuse_js_1.default(filtered_all_teams, name_fuse_options);
    const name_fuse_result = name_fuse.search(team_name);
    const player_fuse = new fuse_js_1.default(filtered_all_teams, player_fuse_options);
    const player_fuse_result = player_fuse.search(team_name);
    if (!name_fuse_result ||
        !name_fuse_result[0]?.score ||
        !(name_fuse_result[0]?.score < .2)) {
        if (!player_fuse_result ||
            !player_fuse_result[0]?.score ||
            !(player_fuse_result[0]?.score < .5)) {
            if (!name_fuse_result ||
                !name_fuse_result[0]?.score ||
                !(name_fuse_result[0]?.score < 0.6)) {
                let emb = new Embeds_1.ErrorEmbed(`Could not find a vrml team with the name: "${team_name}"`);
                return msg_sent ? interaction.edit(emb) : interaction.send(emb);
            }
            else {
                team_name = name_fuse_result[0].item.name;
            }
        }
        else {
            team_name = player_fuse_result[0].item.name;
        }
    }
    else {
        team_name = name_fuse_result[0].item.name;
    }
    // Getting team stats now
    let stats;
    let logos;
    [stats, logos] = await Promise.all([
        request(url_stats_team + team_name, 2 * 60 * 60 * 1000),
        request(logo_url + team_name, 12 * 60 * 60 * 1000),
    ]);
    if (!stats?.name) {
        let emb = new Embeds_1.ErrorEmbed("Something went wrong fetching the vrml stats", JSON.stringify(stats));
        return msg_sent ? interaction.edit(emb) : interaction.send(emb);
    }
    else if (!logos?.[0]?.Logo) {
        logos[0] = {
            Name: team_name,
            Logo: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.hQNEo89LqUCnSl9TFCbHPgHaEK%26pid%3DApi&f=1",
            Fanart: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.hQNEo89LqUCnSl9TFCbHPgHaEK%26pid%3DApi&f=1",
            Division: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.hQNEo89LqUCnSl9TFCbHPgHaEK%26pid%3DApi&f=1",
            Region: "https://vrmasterleague.com/images/World - America - Silver.png",
        };
    }
    const description = `Games played: ${stats.gp}\nWins: ${stats.w}\nLosses: ${stats.l}\nPoints: ${stats.pts}\nMMR: ${stats.mmr || "No mrr yet"}\nRank: ${stats.rank}`;
    // Create the embed
    const embed = new discord_js_1.MessageEmbed();
    // Set some static stuff for the embed
    embed.setColor("#0099ff");
    embed.setTitle(stats.name);
    embed.setAuthor(stats.division, stats.divisionLogo);
    embed.setThumbnail(logos[0].Logo);
    embed.setDescription(description);
    // This spaghetti monster makes the team players look nice
    let team_members = ""; //"```"
    all_teams
        .find((team) => team.name === team_name)
        .players.forEach((player) => {
        if (player.role == "Team Owner") {
            team_members = team_members.concat(`${player.name}, ${player.country},  Owner \n`);
        }
        else {
            team_members = team_members.concat(`${player.name}, ${player.country} \n`);
        }
    });
    team_members = team_members.slice(0, -2);
    embed.addFields({ name: "Team members", value: team_members, inline: false });
    // This spaghetti monster makes the matches look nice
    /*if (team_matches !== []) {
      let match_text = "";
      var print = false;
      team_matches.forEach((match) => {
        print = true;
        match_text = match_text.concat(`[${match.dateScheduled}]\n`);
        match_text = match_text.concat(
          `${match.homeTeam} vs ${match.awayTeam}\n`
        );
  
        if (match.CasterName != "") {
          match_text = match_text.concat(
            `Casted by: [${match.casterName}](${match.channel}) vs \n`
          );
        }
      });
      if (print) {
        embed.addFields({
          name: "Matches this week",
          value: match_text,
          inline: false,
        });
      } else {
        embed.addFields({
          name: "Matches this week",
          value: "No matches found",
          inline: false,
        });
      }
    }*/
    // Add timestamp
    embed.setTimestamp();
    if (msg_sent) {
        interaction.edit(embed);
    }
    else {
        interaction.send(embed);
    }
};
exports.config = {
    name: "echovrml",
    bot_needed: false,
    interaction_options: {
        name: "echovrml",
        description: "Returns stats from the vrml api",
        options: [
            {
                name: "name",
                description: "Team name",
                type: types_1.ApplicationCommandOptionType.STRING,
                required: true,
            },
        ],
    },
};
exports.help = {
    description: "Returns the vrml stats of a team",
    usage: "/echovrml name: TeamNameHere",
};
/*
http://vrmasterleague.com/Services.asmx/GetTeamPlayersStats?game=onward&activeOnly=false&includeRetired=false
https://vrmasterleague.com/Services.asmx/GetTeamStats?game=onward&teamName=MAYHEM

  args[0], actions:
  
  user
  match

  Gets all users and teams
  http://vrmasterleague.com/Services.asmx/GetTeamPlayersStats?game=echoarena&activeOnly=false&includeRetired=false
  
  
  Get team stats, mmr, win, lose, gp, rank
  https://vrmasterleague.com/Services.asmx/GetTeamStats?game=echoarena&teamName=Ignite


  Gets last n played matches
  https://vrmasterleague.com/Services.asmx/GetMatchesRecaps?game=echoarena&max=10
  

  Gets matches being played this week
  https://vrmasterleague.com/Services.asmx/GetMatchesThisWeek?game=echoarena&max=20
  

  https://vrmasterleague.com/Services.asmx/CheckUsernameExists?username=string
  https://vrmasterleague.com/Services.asmx/GetTeamLogo?game=string&teamName=string
  

  https://vrmasterleague.com/Services.asmx


    
*/
/*
https://vrmasterleague.com/Services.asmx/GetTeamStats?game=echoarena&teamName=ignite
{
    "rankWorldwide": 33,
    "rank": 20,
    "division": "Diamond",
    "divisionLogo": "https://vrmasterleague.com/images/div_diamond_40.png",
    "gp": 20,
    "w": 12,
    "t": 0,
    "l": 8,
    "pts": 551,
    "mmr": "1240",
    "id": "fSd2N7iPok_OdZOo-IyTOw2",
    "name": "Ignite",
    "logo": "https://vrmasterleague.com/images/logos/teams/09093858-5626-404d-97a3-10b8353fcc47.png",
    "regionID": "BEllLIXSWM8ZfE4uuRbmCQ2",
    "region": "America East"
}



{
    "rankWorldwide": 2,
    "rank": 1,
    "division": "Master",
    "divisionLogo": "https://vrmasterleague.com/images/div_master_40.png",
    "gp": 17,
    "w": 17,
    "t": 0,
    "l": 0,
    "pts": 598,
    "cycleGP": 8,
    "cycleW": 8,
    "cycleT": 0,
    "cycleL": 0,
    "cycleTieBreaker": 0,
    "cyclePlusMinus": 149,
    "cycleScoreTotal": 262,
    "id": "I0s62s81gK1eswlVkTNz6Q2",
    "name": "Team Gravity",
    "logo": "https://vrmasterleague.com/images/logos/teams/1259745d-c70e-4064-8907-1ee78fcc5725.png",
    "regionID": "QPh6P1Fx-vILEVHkCsDkJQ2",
    "region": "Europe"
}
*/
var Division;
(function (Division) {
    Division[Division["Master"] = 0] = "Master";
    Division[Division["Diamond"] = 1] = "Diamond";
    Division[Division["Gold"] = 2] = "Gold";
    Division[Division["Silver"] = 3] = "Silver";
    Division[Division["Bronze"] = 4] = "Bronze";
})(Division || (Division = {}));
var Region;
(function (Region) {
    Region[Region["Unknown"] = 0] = "Unknown";
    Region[Region["America East"] = 1] = "America East";
    Region[Region["America West"] = 2] = "America West";
    Region[Region["Europe"] = 3] = "Europe";
    Region[Region["Oceania/Asia"] = 4] = "Oceania/Asia";
})(Region || (Region = {}));

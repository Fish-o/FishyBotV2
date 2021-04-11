import * as FishyBot from "fishy-bot-framework";
import { GuildModel } from "./models/Guild";
require("dotenv").config({});

let Client = new FishyBot.FishyClient({
  author: "Fish#2455",
  token: process.env.TOKEN!,
  cmd_dir: "lib/commands",
  event_dir: "lib/events",
  db_uri: process.env.DB_URI!,
  guild_model: GuildModel,
  disable_msg_notfound: true,
});
Client.login();

// Custom commands
// TODO: Welcome screen
// TODO: Roleperms

// Database import

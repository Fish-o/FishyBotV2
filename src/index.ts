import * as FishyBot from "fishy-bot-framework";
import { GuildModel } from "./models/Guild";
require("dotenv").config({});
(async () => {
  console.log("Creating client...");
  let Client = new FishyBot.FishyClient({
    author: "Fish#2455",
    token: process.env.TOKEN!,
    cmd_dir: "lib/commands",
    event_dir: "lib/events",
    db_uri: process.env.DB_URI!,
    guild_model: GuildModel,
    disable_msg_notfound: true,
    info_channel_id: "838138764211126294",
    disable_load_on_construct: true,
  });
  console.log("Loading client...");
  await Client.load();
  Client.once("ready", () => {
    console.log("Started bot successfully!");
  });
  console.log("Logging client in...");
  await Client.login();
  console.log("Awaiting ready event...");
})();

// Custom commands
// TODO: Roleperms

// Database import

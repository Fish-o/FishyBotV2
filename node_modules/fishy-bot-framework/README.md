# FishyBot Framework

A framework for creating complex discord bots easily.

<hr>

### How to use:

1. install the package with `npm install fishy-bot-framework -s`
2. import the package with iether `import * as FBF from "fishy-bot-framework"`
   or `const FBF = require("fishy-bot-framework")`
3. Start a new client:

```TypeScript
import * as FBF from "fishy-bot-framework"
const Client = new FBF.FishyClient({
  token:"discord bot token",
  author:"Your name",
  db_uri: "mongodb://myDBReader:D1fficultP%40ssw0rd@mongos0.example.com:27017",
  guild_model: GuildModel,
  cmd_dir: "./src/commands",
  
})
Client.login()
```

### Commands:

A basic command should look something like this

```TypeScript
// The code that gets run when the command gets called;
// It takes the arguments `FishyClient` and `Interaction`
export const run: FishyCommandCode = async (client, interaction) => {
  interaction.send(`Current websocket ping: \`${client.ws.ping}ms\``);
};

// The configuration of the commands, it needs this to run
export const config: FishyCommandConfig = {
  name: "ping",               // Name of the command
  bot_needed: false,          // If the bot user is required to be in the guild
                              // Needed for `Interaction.channel.send()` for example
  interaction_options: {      // Discord interaction options
                              // https://discord.com/developers/docs/interactions/slash-commands#create-global-application-command-json-params
    name: "ping",
    description: "Ping the bot"
  },
};

// Extra info for the help command
export const help: FishyCommandHelp = {
  description: "Returns the websocket ping of the bot",
  usage: "/ping",
};
```


Commands can be stored like this
```
create - /commands/"category"/
create - /commands/"category"/index.js
export - "name" & "description" from /commands/"category"/index.js
create - /commands/"category"/command.js
```
Example:

![image](https://cdn.discordapp.com/attachments/739529254219284500/823534291233406987/unknown.png)










## Database
Required Mongoose data fields:
```JavaScript
{
  id: String,     // The guild's id for fetching, index this
  settings: Map   // Used for disabeling commands
}
```


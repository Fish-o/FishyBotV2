import { ClientEvents, Collection, Message } from "discord.js";
import { FishyClient } from "fishy-bot-framework";
import fs from "fs";
import path from "path";
const commands = new Collection<string, Function>();

fs.readdir(path.join(process.cwd(), "../debug/"), (direrr, files) => {
  if (direrr) {
    return console.log("Unable to scan directory: " + direrr);
  }
  console.log(files);
  files.forEach((file) => {
    const file_path = path.join(process.cwd(), "../debug/", file);

    // Go thru all files in the subdir
    files.forEach((file) => {
      // Check if they end with .js
      if (!file.endsWith(".js")) return;
      // Load the command file
      let command_file = require(file_path);

      // Set the command file with the file path
      console.log(`Loading Command: ${command_file.name}`);
      commands.set(command_file.name, command_file.run);
    });
  });
});

export const trigger: keyof ClientEvents = "message";
export async function run(client: FishyClient, message: Message) {
  const prefix = "[]";
  if (
    message.content.trim().startsWith(prefix) &&
    message.author.id === "325893549071663104"
  ) {
    const whole_command = message.content.trim().slice(prefix.length);
    const command = whole_command.split(" ").shift()!.trim().toLowerCase();
    if (commands.has(command)) {
      const run = commands.get(command)!;
      run(client, message, whole_command);
    }
    //
  }
  //
}

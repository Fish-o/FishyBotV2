import { Snowflake, TextChannel, Collection, MessageEmbed } from "discord.js";
import { Interaction } from "fishy-bot-framework/lib/structures/Interaction";
import { InteractionDataOption } from "fishy-bot-framework/lib/structures/InteractionOptions";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";
import { WarnEmbed } from "fishy-bot-framework/lib/utils/Embeds";
import {
  custom_slash_commands,
  ReloadSlashCommands,
} from "../../utils/fishycode";
import { description } from "../games";

const options_cache = new Collection<Snowflake, custom_slash_commands>();
export const run: FishyCommandCode = async (client, interaction) => {
  const action = interaction.data.options[0].name;
  const member_id = interaction.raw_member?.user?.id;
  if (!member_id) return;
  if (action === "create") {
    if (options_cache.has(interaction.raw_member?.user?.id || ""))
      return interaction.sendSilent(
        "You are already creating a command, to stop run /customcommands cancel "
      );
    let name = interaction.data.options[0].options.find(
      (opt) => opt.name === "name"
    )?.value;
    let description = interaction.data.options[0].options.find(
      (opt) => opt.name === "description"
    )?.value;
    if (!name || typeof name !== "string" || !name.match(/^[\w-]{1,32}$/gi))
      return interaction.sendSilent("Invalid name, it must be only letters");
    else if (client.commands.has(name)) {
      return interaction.sendSilent(
        "There is a FishyBot command with the same name already!"
      );
    }
    if (
      !description ||
      typeof description !== "string" ||
      description.length > 100
    )
      return interaction.sendSilent("Invalid description, maybe to long?");
    name = name.toLowerCase();
    let db_data = await interaction.getDbGuild();
    if (!db_data || db_data.custom_slash_commands[name])
      return interaction.sendSilent(
        `You can only have one custom slash command with the name \`${name}\``
      );
    options_cache.set(member_id, {
      timestamp: Date.now(),
      name: name,
      description: description,
      options: [],
    });
    interaction.sendSilent(`You have started the custom **slash** command creation system!
    To add an argument run \`/customcommands addoption\`
    To finish run \`/customcommands finish response:FISHYCODE\`
    
    **How does FishyCode work?**
    If you dont want to do anything special you can just enter the response you want it to give.
    You can get the value of one of your arguments like this:  \`Wait {{ member_person.mention }} is {{ int_age }} years old already!?\`
    So basically : {{ argumentType_argumentName }}, and if the argument is a member you get these propperties:  \`.mention\`, \`.id\`, \`.displayname\` and \`.tag\`
    
    `);
  } else if (action === "cancel") {
    if (!options_cache.has(member_id))
      return interaction.sendSilent("Nothing to cancel...");
    options_cache.delete(member_id);
    return interaction.sendSilent("Canceled!");
  } else if (action === "addoption") {
    const options_cache_data = options_cache.get(member_id);
    if (!options_cache.has(member_id) || !options_cache_data)
      return interaction.sendSilent(
        "Start creating a custom slash command first!\n/customcommands create"
      );

    const entered_options = interaction.data.options[0].options;
    const d = entered_options.find((opt) => opt.name == "description")?.value;
    let name = entered_options.find((opt) => opt.name == "name")?.value;
    const description = d;
    const raw_type = entered_options.find((opt) => opt.name == "type")?.value;

    // CHECKS
    if (!name || !description || !raw_type)
      return interaction.sendSilent("You entered an invalid option u dumbass");
    else if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof raw_type !== "string" ||
      !["str", "int", "member"].includes(raw_type)
    )
      return interaction.sendSilent(
        "You entered an invalid option u fat dumbass"
      );
    else if (
      options_cache_data.options.find(
        (opt) => opt.name.toLowerCase() == name?.toString()?.toLowerCase()
      )
    )
      return interaction.sendSilent(
        `You can only have one argument with the name \`${name.toLowerCase()}\``
      );
    name = name.toLowerCase();
    if (!name.match(/^[\w-]{1,32}$/)) {
      return interaction.sendSilent("The entered name is invalid");
    } else if (description.length > 99) {
      return interaction.sendSilent("That description is too long");
    }
    // checks done

    // Set type
    let type: ApplicationCommandOptionType;
    if (raw_type === "str") {
      type = ApplicationCommandOptionType.STRING;
    } else if (raw_type === "int") {
      type = ApplicationCommandOptionType.INTEGER;
    } else if (raw_type === "member") {
      type = ApplicationCommandOptionType.USER;
    } else {
      return interaction.sendSilent("Invalid type _somehow_");
    }

    let option: ApplicationCommandOption = {
      name,
      description,
      type,
      required: true,
    };
    options_cache_data.options.push(option);
    options_cache.set(member_id, options_cache_data);

    interaction.sendSilent(
      `Added the option: \`${name}\`\ndesc: \`${description}\`\ntype: \`${raw_type}\``
    );
  } else if (action === "finish") {
    const options_cache_data = options_cache.get(member_id);
    if (!options_cache.has(member_id) || !options_cache_data)
      return interaction.sendSilent(
        "Start creating a custom slash command first!\n/customcommands create"
      );
    const FishyCode = interaction.data.options[0].options[0]?.value;
    if (!FishyCode || typeof FishyCode !== "string") {
      return interaction.sendSilent("Invalid FishyCode, try again");
    }
    let update = {
      custom_slash_commands: FishyCode,
    };
    let db_data = await interaction.getDbGuild();
    if (!db_data || db_data.custom_slash_commands[options_cache_data.name])
      return interaction.sendSilent(
        `You can only have one custom slash command with the name \`${options_cache_data.name}\``
      );
    options_cache_data.code = FishyCode;
    await interaction.updateDbGuild({
      ["custom_slash_commands." + options_cache_data.name]: options_cache_data,
    });
    interaction.sendSilent("Made the command!! :D");
    ReloadSlashCommands(interaction);
  } else if (action === "reload") {
    interaction.send(
      new WarnEmbed(
        "Reloading commands...",
        "This might take some time depending on how many commands to reload, so please be patient"
      )
    );
    await ReloadSlashCommands(interaction);
    interaction.edit(
      new MessageEmbed()
        .setTitle("Reloaded commands!")
        .setTimestamp()
        .setColor("GREEN")
    );
  } else if (action === "list") {
    const db_guild = await interaction.getDbGuild();
    const custom_slash_commands: { [key: string]: custom_slash_commands } =
      db_guild.custom_slash_commands;
    if (!custom_slash_commands || !Object.keys(custom_slash_commands)?.[0])
      return interaction.send("No custom slash commands!");

    if (interaction.data.options[0]?.options?.[0]?.name === "command") {
      if (typeof interaction.data.options[0].options[0].value !== "string")
        return;
      let command: custom_slash_commands =
        db_guild.custom_slash_commands[
          interaction.data.options[0].options[0].value.toLowerCase()
        ];
      if (!command || !command.name)
        return interaction.sendSilent(
          `The interaction "${interaction.data.options[0].options[0].value.toLowerCase()}" doesn't exist`
        );
      function convertTypeString(raw: ApplicationCommandOptionType): string {
        let type = "none?!";
        if (raw == ApplicationCommandOptionType.STRING) {
          type = "str";
        } else if (raw == ApplicationCommandOptionType.INTEGER) {
          type = "int";
        } else if (raw == ApplicationCommandOptionType.USER) {
          type = "member";
        }

        return type;
      }

      let embed = new MessageEmbed().setTitle("Slash command: " + command.name);
      embed.setDescription(`**Options:**
      ${
        command.options
          ?.map(
            (opt) =>
              `\`${convertTypeString(opt.type)}_${opt.name}\`: \`${
                opt.description
              }\` `
          )
          .join("\n") || "None"
      }
      
      **Response Code:**
      \`${command.code}\``);
      return interaction.send(embed);
    } else {
      let out = new MessageEmbed()
        .setTitle("Custom slash commands for this server")
        .setColor("RANDOM")
        .setTimestamp();
      Object.values(custom_slash_commands).forEach((command) => {
        out.addField(command.name, command.description, true);
      });
      interaction.send(out);
    }
  } else if (action === "delete") {
    const command = interaction.data.options[0].options[0]?.value;
    if (!command || typeof command !== "string")
      return interaction.sendSilent("OI, enter a command");
    const db_guild = await interaction.getDbGuild();
    const cc: custom_slash_commands =
      db_guild.custom_slash_commands[command.toLowerCase()];
    if (!cc || !cc.name)
      return interaction.sendSilent("That command doesn't exists");

    await interaction.updateDbGuild({
      $unset: { ["custom_slash_commands." + cc.name]: "" },
    });
    interaction.send(`Removed the custom slash command "${cc.name}"!`);

    //
  }
  // TODO: edit?
};

export const config: FishyCommandConfig = {
  name: "customcommands",
  bot_needed: true,
  user_perms: ["ADMINISTRATOR"],
  interaction_options: {
    name: "customcommands",
    description: "Create custom commands for your server",
    options: [
      {
        name: "create",
        description: "Start the creation wizard",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "name",
            description: "The name of the custom slash command",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
          {
            name: "description",
            description: "The description of the custom slash command",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
        ],
      },
      {
        name: "addoption",
        description: "Add an option while creating a custom command",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "type",
            description: "What type of option to add",
            required: true,
            type: ApplicationCommandOptionType.STRING,
            choices: [
              {
                name: "str",
                value: "str",
              },
              {
                name: "member",
                value: "member",
              },
              {
                name: "int",
                value: "int",
              },
            ],
          },
          {
            name: "name",
            description: "The name to give the option",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
          {
            name: "description",
            description: "The description to give the option",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
        ],
      },
      {
        name: "finish",
        description: "Finish creating the new command",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "response",
            description: "FishyCode go here",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
        ],
      },
      {
        name: "cancel",
        description: "Cancel the creation",
        type: ApplicationCommandOptionType.SUB_COMMAND,
      },
      {
        name: "list",
        description: "List all your custom slash commands",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "command",
            description: "View a specific command",
            type: ApplicationCommandOptionType.STRING,
          },
        ],
      },
      {
        name: "reload",
        description: "Reload all custom slash commands",
        type: ApplicationCommandOptionType.SUB_COMMAND,
      },
      {
        name: "delete",
        description: "Delete a custom command",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "command",
            description: "The command to remove",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
        ],
      },
    ],
  },
};

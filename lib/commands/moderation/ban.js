"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.config = exports.run = void 0;
const discord_js_1 = require("discord.js");
const types_1 = require("fishy-bot-framework/lib/types");
const Embeds_1 = require("fishy-bot-framework/lib/utils/Embeds");
exports.run = async (client, interaction) => {
    const user_id = interaction.args.find((arg) => arg.name == "user")?.value;
    if (!user_id) {
        return interaction.send(new Embeds_1.ErrorEmbed("Please enter a user whom to ban"));
    }
    try {
        let guild_member = await interaction.guild.members.ban(user_id);
        let name = "";
        if (guild_member instanceof discord_js_1.GuildMember)
            name = guild_member.user.tag;
        else if (guild_member instanceof discord_js_1.User)
            name = guild_member.tag;
        else
            name = guild_member;
        interaction.send(new Embeds_1.ErrorEmbed(`Succesfully banned user "${name}"`).setColor("GREEN"));
    }
    catch (err) {
        console.error(err);
        interaction.send(new Embeds_1.ErrorEmbed("Could not ban that user", `A few things that could cause this:
1) Does the user has a role higher then the FishyBot role?
2) Does FishyBot have neither of the "ban members" or "administator" permissions?
3) Is that person the server owner?`));
    }
};
exports.config = {
    name: "ban",
    bot_needed: true,
    user_perms: ["BAN_MEMBERS"],
    bot_perms: ["BAN_MEMBERS"],
    interaction_options: {
        name: "ban",
        description: "Ban a member from this server",
        options: [
            {
                required: true,
                name: "user",
                description: "User whom to ban",
                type: types_1.ApplicationCommandOptionType.USER,
            },
        ],
    },
};
exports.help = {
    description: "Ban a member from this server",
    usage: "/ban user: user",
};

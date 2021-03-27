"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.config = exports.run = void 0;
const types_1 = require("fishy-bot-framework/lib/types");
const Embeds_1 = require("fishy-bot-framework/lib/utils/Embeds");
exports.run = async (client, interaction) => {
    const member_id = interaction.args.find((arg) => arg.name == "member")?.value;
    if (!member_id) {
        return interaction.send(new Embeds_1.ErrorEmbed("Please enter a member whom to kick"));
    }
    const member = await interaction.guild.members.fetch(member_id);
    if (!member) {
        return interaction.send(new Embeds_1.ErrorEmbed("Could not find that member"));
    }
    const failed_embed = new Embeds_1.ErrorEmbed("Could not kick that member", `A few things that could cause this:
1) Does the user has a role higher then the FishyBot role?
2) Does FishyBot have neither of the "kick members" or "administator" permissions?
3) Is that person the server owner?`);
    if (!member.kickable) {
        return interaction.send(failed_embed);
    }
    try {
        let guild_member = await member.kick(member_id);
        interaction.send(new Embeds_1.ErrorEmbed(`Succesfully kicked user "${guild_member.user.tag}"`).setColor("GREEN"));
    }
    catch (err) {
        console.error(err);
        interaction.send(failed_embed);
    }
};
exports.config = {
    name: "kick",
    bot_needed: true,
    user_perms: ["KICK_MEMBERS"],
    bot_perms: ["KICK_MEMBERS"],
    interaction_options: {
        name: "kick",
        description: "Kick a member from this server",
        options: [
            {
                required: true,
                name: "member",
                description: "Member whom to kick",
                type: types_1.ApplicationCommandOptionType.USER,
            },
        ],
    },
};
exports.help = {
    description: "Kick a member from this server",
    usage: "/kick member: user",
};

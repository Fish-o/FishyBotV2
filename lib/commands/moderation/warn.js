"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.config = exports.run = void 0;
const discord_js_1 = require("discord.js");
const types_1 = require("fishy-bot-framework/lib/types");
const Embeds_1 = require("fishy-bot-framework/lib/utils/Embeds");
exports.run = async (client, interaction) => {
    console.log(interaction.raw_interaction);
    if (!interaction.args[0]?.options)
        return interaction.sendSilent("Stop breaking shit >:(");
    const action = interaction.args[0]?.name;
    if (!action || !["add", "list", "remove"].includes(action))
        return interaction.sendSilent("Stop breaking shit >:(");
    if (action === "add") {
        const memberId = interaction.args[0].options.find((arg) => arg.name === "member")?.value;
        let reason = interaction.args[0].options.find((arg) => arg.name === "reason")?.value;
        if (!memberId) {
            return interaction.send(new Embeds_1.ErrorEmbed("Please enter a member to warn"));
        }
        reason = reason || "No reason provided";
        const warn = {
            timestamp: Date.now(),
            warner: interaction.member?.id,
            reason: reason,
        };
        if (!warn.warner)
            throw Error("Could not get warner name, does this server have the bot in it?");
        await interaction.updateDbGuild({
            $push: {
                [`warnings.${memberId}`]: { $each: [warn], $position: -1 },
            },
        });
        var bad_pfp = interaction.member?.user.avatarURL();
        const embed = new discord_js_1.MessageEmbed();
        embed.setColor("#ff2222");
        embed.setTitle(`Member: ${interaction.member?.user.tag} has been warned`);
        embed.addField("Reason: ", reason);
        embed.setThumbnail(bad_pfp || "");
        interaction.send(embed);
    }
    else if (action === "list") {
        const memberId = interaction.args[0].options.find((arg) => arg.name === "member")?.value;
        if (!memberId) {
            return interaction.send(new Embeds_1.ErrorEmbed("Please enter a name to view the warning from"));
        }
        const db_guild = await interaction.getDbGuild();
        const user_warnins = db_guild.warnings[memberId];
        const member = await interaction.guild?.members.fetch(memberId);
        if (!user_warnins ||
            !user_warnins[0] ||
            !user_warnins.find((warn) => !warn.removed)) {
            return interaction.send(new discord_js_1.MessageEmbed()
                .setTimestamp()
                .setColor("GREEN")
                .setTitle(`No warnings found for: ${member?.user.tag}`)
                .setDescription(`To warn this member run \`/warn add member: ${member?.displayName}\``));
        }
        const embed = new discord_js_1.MessageEmbed();
        embed.setColor("#ff00ff");
        embed.setTitle("Warnings for user: " + member?.user.tag);
        embed.addFields(user_warnins
            .filter((warn) => !warn.removed)
            .map((warning) => {
            var date_time = new Date(warning.timestamp).toDateString();
            try {
                let data = {
                    name: `#${user_warnins.indexOf(warning)} - ${date_time} - by ${client.users.cache.get(warning.warner)?.tag}`,
                    value: `Reason: \`${warning.reason}\``,
                };
                return data;
            }
            catch (err) {
                console.error(err);
                let data = {
                    name: `hmmm`,
                    value: `It broke :)`,
                };
                return data;
            }
        }));
        embed.setThumbnail(member?.user.avatarURL());
        embed.setTimestamp();
        interaction.send(embed);
    }
    else if (action === "remove") {
        const memberId = interaction.args[0].options.find((arg) => arg.name === "member")?.value;
        const id = interaction.args[0].options.find((arg) => arg.name === "id")?.value;
        if (!memberId || !id)
            return;
        const db_guild = await interaction.getDbGuild();
        if (!db_guild.warnings[memberId]) {
            return interaction.send(new Embeds_1.ErrorEmbed(`There is no warning #${id} for "${interaction.guild?.members.cache.get(memberId)?.user.tag}"`));
        }
        else if (db_guild.warnings[memberId].removed == true) {
            return interaction.send(new Embeds_1.ErrorEmbed(`The warning #${id} for "${interaction.guild?.members.cache.get(memberId)?.user.tag}" was already deleted
      `));
        }
        let res = await interaction.updateDbGuild({
            $set: { [`warnings.${id}.removed`]: true },
        });
        const embed = new discord_js_1.MessageEmbed()
            .setColor("BLUE")
            .setTimestamp()
            .setTitle("Removed warning")
            .setDescription(`Succesfully removed warning #${id} from "${interaction.guild?.members.cache.get(memberId)}"`);
        interaction.send(embed);
    }
};
exports.config = {
    name: "warn",
    bot_needed: true,
    user_perms: ["MANAGE_MESSAGES"],
    interaction_options: {
        name: "warn",
        description: "Warn a member",
        options: [
            {
                name: "add",
                description: "Add a warning",
                type: types_1.ApplicationCommandOptionType.SUB_COMMAND,
                options: [
                    {
                        name: "member",
                        description: "The member to warn",
                        type: types_1.ApplicationCommandOptionType.USER,
                        required: true,
                    },
                    {
                        name: "reason",
                        description: "The reason for warning that member",
                        type: types_1.ApplicationCommandOptionType.STRING,
                    },
                ],
            },
            {
                name: "list",
                description: "View a members warnings",
                type: types_1.ApplicationCommandOptionType.SUB_COMMAND,
                options: [
                    {
                        name: "member",
                        description: "The member to view the warnings of",
                        type: types_1.ApplicationCommandOptionType.USER,
                        required: true,
                    },
                ],
            },
            {
                name: "remove",
                description: "Remove a warning from a member",
                type: types_1.ApplicationCommandOptionType.SUB_COMMAND,
                options: [
                    {
                        name: "member",
                        description: "The member to remove the warning from",
                        type: types_1.ApplicationCommandOptionType.USER,
                        required: true,
                    },
                    {
                        name: "id",
                        description: "The id of warning to remove",
                        type: types_1.ApplicationCommandOptionType.INTEGER,
                        required: true,
                    },
                ],
            },
        ],
    },
};
exports.help = {
    description: "Warn a member",
    usage: "/warn [add/list/remove] member",
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.config = exports.run = void 0;
exports.run = async (client, interaction) => {
    interaction.sendSilent('Pong!');
};
exports.config = {
    name: "ping",
    bot_needed: false,
    interaction_options: {
        name: "ping",
        description: "Ping the bot"
    },
};
exports.help = {
    description: "Pong!?",
    usage: "/ping",
};

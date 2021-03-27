"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildModel = void 0;
const mongoose_1 = require("mongoose");
const GuildConfigSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    settings: { type: Object, required: true, default: {} },
    warnings: { type: Object, required: true, default: {} },
});
exports.GuildModel = mongoose_1.model("guilds", GuildConfigSchema);

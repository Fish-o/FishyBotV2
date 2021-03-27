import { Schema, model } from "mongoose";

const GuildConfigSchema = new Schema({
  id: { type: String, required: true },
  settings: { type: Object, required: true, default: {} },
  warnings: { type: Object, required: true, default: {} },
});
export const GuildModel = model("guilds", GuildConfigSchema);

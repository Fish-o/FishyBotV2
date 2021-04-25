import { Schema, model } from "mongoose";

const IgniteOverrideSchema = new Schema({
  username: String,

  stats: Map,
});
export const IgniteOverride = model("igniteoverrides", IgniteOverrideSchema);
export default IgniteOverride;

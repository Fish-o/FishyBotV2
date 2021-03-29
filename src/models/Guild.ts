import { Schema, model } from "mongoose";

const GuildConfigSchema = new Schema({
  id: { type: String, required: true },
  settings: { type: Object, required: true, default: {} },
  warnings: { type: Object, required: true, default: {} },
  prefix: {
    type: String,
    required: false,
  },
  memberlist: {
    type: Array,
    required: false,
  },
  filters: {
    type: Object,
    required: false,
  },
  roleperms: {
    type: Object,
    required: false,
    default: {},
  },
  usernames: {
    type: Map,
    required: false,
    default: {},
  },
  randomstuff: {
    type: {
      simpcounter: {
        type: Object,
        required: true,
        default: {},
      },
    },
    required: true,
    default: { simpcounter: {} },
  },
  member_count_channel: {
    type: String,
    required: false,
  },
  logging: {
    type: {
      webhook: {
        type: {
          id: {
            type: String,
            required: true,
          },
          token: {
            type: String,
            required: true,
          },
        },
        required: true,
      },
      channel_id: {
        type: String,
        required: true,
      },
    },
    required: false,
  },
  joinMsg: {
    type: {
      channelId: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        required: false,
      },
      title: {
        type: {
          b: {
            type: String,
            required: true,
          },
          s: {
            type: String,
            required: true,
          },
        },
        required: false,
      },
      desc: {
        type: {
          b: {
            type: String,
            required: true,
          },
          s: {
            type: String,
            required: true,
          },
        },
        required: false,
      },
      message: {
        type: String,
        required: false,
      },
      dm: {
        type: String,
        required: false,
      },
    },
    required: false,
  },
  custom_commands: {
    type: Object,
    required: false,
  },
  levels: {
    type: {
      members: {
        type: Map,
        required: true,
        default: new Map(),
      },
      channel: {
        type: String,
        required: false,
      },
      lvlUpMsg: {
        type: String,
        required: false,
      },
    },
    required: true,
    default: {
      members: new Map(),
    },
  },
  features: {
    type: Array,
    required: false,
  },

  defaultroles: {
    type: Array,
    required: false,
  },
});
export const GuildModel = model("guilds", GuildConfigSchema);

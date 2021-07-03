import {
  ComponentStyle,
  ComponentType,
  FishyComponentCommandCode,
  FishyComponentCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";

export const run: FishyComponentCommandCode = async (client, interaction) => {
  if (Math.random() > 0.02 || !interaction.member?.kickable) {
    interaction.send(`${interaction.member} pressed me :(`);
  } else {
    try {
      const invite =
        (await interaction.guild?.fetchInvites())?.find(
          (inv) =>
            !inv.expiresTimestamp ||
            inv.expiresTimestamp >= Date.now() + 2 * 24 * 60 * 60 * 1000
        ) ||
        (await interaction.channel?.createInvite({
          maxAge: 0,
          maxUses: 0,
        }));
      if (!invite?.url) {
        return interaction.send(`${interaction.member} pressed me :(`);
      }

      await interaction.member.user.send(
        `Don't press me again >:(\n${invite.url}`
      );

      await interaction.member.kick(
        `roles: '${interaction.member.roles.cache
          .map((role) => role.name)
          .join("', '")}'`
      );
      interaction.send("THAT WHAT YOU GET FOR PRESSING ME! ");
    } catch (err) {
      interaction.send(`${interaction.member} pressed me :(`);
      console.log(err);
    }
  }
};

export const config: FishyComponentCommandConfig = {
  custom_id: "selfyeet",
  atStart: true,
  bot_needed: true,
};

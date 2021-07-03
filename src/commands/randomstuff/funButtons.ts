import {
  ComponentActionRow,
  ComponentButton,
  ComponentStyle,
  ComponentType,
  FishyComponentCommandCode,
  FishyComponentCommandConfig,
} from "fishy-bot-framework/lib/types";

export function generateFunButtons(
  currentButtons?: { type: number; components: ComponentButton[] }[],
  pressed?: [number, number],
  prefStyle?: ComponentStyle
): ComponentActionRow[] {
  if (!currentButtons || !pressed || !prefStyle) {
    let response: ComponentActionRow[] = [];
    for (let y = 0; y < 5; y++) {
      let row: ComponentButton[] = [];
      for (let x = 0; x < 5; x++) {
        row.push({
          emoji: { name: "🐟" },

          style: ComponentStyle.Primary,
          type: ComponentType.Button,
          custom_id: `funButton_${x}|${y}|${1}`,
        });
      }
      response.push({
        components: row,
        type: ComponentType.ActionRow,
      });
    }
    return response;
  }
  let newStyle = prefStyle + 1;
  if (newStyle > ComponentStyle.Danger) newStyle = 1;
  currentButtons[pressed[1]].components[pressed[0]].style = newStyle;
  currentButtons[pressed[1]].components[
    pressed[0]
  ].custom_id = `funButton_${pressed[0]}|${pressed[1]}|${newStyle}`;
  return currentButtons;
}

export const run: FishyComponentCommandCode = async (client, interaction) => {
  const custom_id = interaction.data.custom_id;
  const data = custom_id.slice(config.custom_id.length).split("|");
  const x = data.shift();
  const y = data.shift();
  const prevStyle = data.shift();
  if (!x || !y || !prevStyle)
    return interaction.sendSilent("You broke something");
  if (!interaction.message.components) {
    console.error("FUN BUTTON ERROR");
    console.error(new Date().toISOString());
    console.error(interaction.raw_interaction);
    console.error(interaction.message);
    return interaction.sendSilent("NO COMPOONETNNETNS?");
  } else if (interaction.message.components[0].type !== ComponentType.ActionRow)
    return interaction.sendSilent(
      "Button not a button array bot a button ds jj  fa kd*UY#(*UJN"
    );
  await interaction.deferUpdateMessage();

  let buttons = generateFunButtons(
    // @ts-ignore
    interaction.message.components,
    [Number.parseInt(x), Number.parseInt(y)],
    Number.parseInt(prevStyle)
  );
  interaction.edit("Enjoy these buttons", { components: buttons });
};
export const config: FishyComponentCommandConfig = {
  custom_id: "funButton_",
  atStart: true,
  bot_needed: true,
};

import { MessageEmbed } from "discord.js";
import {
  ComponentActionRow,
  ComponentStyle,
  ComponentType,
  FishyCommandCode,
  FishyCommandConfig,
  InteractionApplicationCommandCallbackData,
} from "fishy-bot-framework/lib/types";
import { Decimal } from "decimal.js";
import Mea from "math-expression-evaluator";
const splice = function (
  string: string,
  idx: number,
  rem: number,
  str: string
) {
  return string.slice(0, idx) + str + string.slice(idx + Math.abs(rem));
};
export function parseCalculate(input: string): undefined | string {
  const input2 = input.replace(/×/g, "*");
  let str = input2.replace(/[^-()\d/*+.\^]/g, "");

  if (!str || str.length < 1) return "NaN";

  try {
    let res = Mea.eval(str);
    return res;
  } catch (err) {
    console.error(err);
    return `Error\n${err.message}`;
  }
}

export interface CalculationInterface {
  started: number;
  calculation: string;
}
export const Calculations = new Map<string, CalculationInterface>();

export function renderCalculator(
  calculation: string,
  memberID: string,
  disableComponents?: boolean
): [MessageEmbed, ComponentActionRow[]] {
  const res = parseCalculate(calculation) ?? "NaN";
  const embed = new MessageEmbed().setColor("#2F3136").setTitle("Calculator")
    .setDescription(`\`\`\`
${calculation} = ${res}
\`\`\``);

  let components: ComponentActionRow[] = [
    {
      type: ComponentType.ActionRow,
      components: [
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|7`,
          disabled: disableComponents,
          label: "7",
        },
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|8`,
          label: "8",
          disabled: disableComponents,
        },
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|9`,
          label: "9",
          disabled: disableComponents,
        },
        {
          style: ComponentStyle.Primary,
          type: ComponentType.Button,
          label: "×",
          custom_id: `calc_${memberID}|×`,
          disabled: disableComponents,
        },
        {
          style: ComponentStyle.Danger,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|AC`,
          label: "AC",
          disabled: disableComponents,
        },
      ],
    },
    {
      type: ComponentType.ActionRow,
      components: [
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|4`,
          disabled: disableComponents,
          label: "4",
        },
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|5`,
          disabled: disableComponents,
          label: "5",
        },
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|6`,
          disabled: disableComponents,
          label: "6",
        },
        {
          style: ComponentStyle.Primary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|/`,
          disabled: disableComponents,
          label: "/",
        },
        {
          style: ComponentStyle.Danger,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|CE`,
          disabled: disableComponents,
          label: "CE",
        },
      ],
    },
    {
      type: ComponentType.ActionRow,
      components: [
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|1`,
          disabled: disableComponents,
          label: "1",
        },
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|2`,
          disabled: disableComponents,
          label: "2",
        },
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|3`,
          disabled: disableComponents,
          label: "3",
        },
        {
          style: ComponentStyle.Primary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|+`,
          disabled: disableComponents,
          label: "+",
        },
        {
          style: ComponentStyle.Danger,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|EXIT`,
          disabled: disableComponents,
          label: "Exit",
        },
      ],
    },
    {
      type: ComponentType.ActionRow,
      components: [
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|00`,
          disabled: disableComponents,
          label: "00",
        },
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|0`,
          disabled: disableComponents,
          label: "0",
        },
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|.`,
          disabled: disableComponents,
          label: ".",
        },
        {
          style: ComponentStyle.Primary,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|-`,
          disabled: disableComponents,
          label: "−",
        },
        {
          style: ComponentStyle.Success,
          type: ComponentType.Button,
          custom_id: `calc_${memberID}|=`,
          disabled: disableComponents,
          label: "=",
        },
      ],
    },
    {
      components: [
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          label: "(",
          disabled: disableComponents,
          custom_id: `calc_${memberID}|(`,
        },
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          disabled: true,
          label: "  ",
          custom_id: "calc_",
        },
        {
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          label: ")",
          disabled: disableComponents,
          custom_id: `calc_${memberID}|)`,
        },
      ],

      type: ComponentType.ActionRow,
    },
  ];
  return [embed, components];
}

export const run: FishyCommandCode = async (client, interaction) => {
  Calculations.set(interaction.raw_user.id, {
    calculation: "",
    started: Date.now(),
  });
  let res = renderCalculator("", interaction.raw_user.id);
  interaction.send(res[0], { components: res[1] });
};

export const config: FishyCommandConfig = {
  name: "calculator",
  bot_needed: false,
  interaction_options: {
    name: "calculator",
    description: "Calculate all the things!",
  },
};

import {
  FishyButtonCommandCode,
  FishyButtonCommandConfig,
} from "fishy-bot-framework/lib/types";
import ms from "ms";
import { Calculations, parseCalculate, renderCalculator } from "./calculator";
const buttons = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "00",
  "/",
  "-",
  "+",
  "×",
  ".",
  "(",
  ")",
];

export const run: FishyButtonCommandCode = async (client, interaction) => {
  interaction.deferButton();
  const custom_id = interaction.customID;
  const data = custom_id.slice(config.custom_id.length).split("|");
  const memberID = data.shift();
  const button = data.shift();
  if (!memberID || !button || interaction.raw_user.id !== memberID) return;
  let calculator = Calculations.get(memberID);
  if (!calculator) return;
  else if (calculator.started + ms("6 hours") < Date.now())
    return Calculations.delete(memberID);
  let calculation = calculator.calculation;
  if (buttons.includes(button)) {
    calculation = calculation + button;
  } else if (button === "AC") {
    calculation = "";
  } else if (button === "CE") {
    if (calculation.length > 0)
      calculation = calculation.substring(0, calculation.length - 1);
  } else if (button === "EXIT") {
    Calculations.delete(memberID);
    const RenderedCalculator = renderCalculator(calculation, memberID, true);
    interaction.edit(RenderedCalculator[0], {
      components: RenderedCalculator[1],
    });
    return;
  } else if (button === "=") {
    let res = parseCalculate(calculation);
    calculation = `${res ?? calculation}`;
  }
  Calculations.set(memberID, {
    calculation: calculation,
    started: calculator.started,
  });

  const RenderedCalculator = renderCalculator(calculation, memberID);
  interaction.edit(RenderedCalculator[0], {
    components: RenderedCalculator[1],
  });
};

export const config: FishyButtonCommandConfig = {
  custom_id: "calc_",
  user_perms: [],
  atStart: true,
  bot_needed: false,
};

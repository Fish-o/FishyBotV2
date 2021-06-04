import { MessageEmbed } from "discord.js";
import {
  ApplicationCommandOptionType,
  ComponentActionRow,
  ComponentStyle,
  ComponentType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";

enum fields {
  BG = "🟩",
  HEAD = "🐴",
  EATING_HEAD = "🦄",
  BODY = "🟤",
  FOOD = "🍎",
}
const base_width = 10;
const base_height = 10;

function Components(
  direction: "LEFT" | "RIGHT" | "UP" | "DOWN" | string
): ComponentActionRow[] {
  if (direction === "LEFT") direction = "RIGHT";
  else if (direction === "RIGHT") direction = "LEFT";
  else if (direction === "UP") direction = "DOWN";
  else if (direction === "DOWN") direction = "UP";

  return [
    {
      components: [
        {
          type: ComponentType.Button,
          style: ComponentStyle.Secondary,
          disabled: true,
          custom_id: "snake_disabled",
          label: " ",
        },
        {
          type: ComponentType.Button,
          style: ComponentStyle.Primary,
          custom_id: "snake_UP",
          disabled: direction === "UP",
          emoji: {
            name: "⬆️",
          },
        },
        {
          type: ComponentType.Button,
          style: ComponentStyle.Secondary,
          disabled: true,
          custom_id: "snake_disabled",
          label: " ",
        },
      ],
      type: ComponentType.ActionRow,
    },
    {
      components: [
        {
          type: ComponentType.Button,
          style: ComponentStyle.Primary,
          custom_id: "snake_LEFT",
          disabled: direction === "LEFT",
          emoji: {
            name: "⬅️",
          },
        },
        {
          type: ComponentType.Button,
          style: ComponentStyle.Primary,
          custom_id: "snake_DOWN",
          disabled: direction === "DOWN",
          emoji: {
            name: "⬇️",
          },
        },
        {
          type: ComponentType.Button,
          style: ComponentStyle.Primary,
          custom_id: "snake_RIGHT",
          disabled: direction === "RIGHT",
          emoji: {
            name: "➡️",
          },
        },
      ],
      type: ComponentType.ActionRow,
    },
  ];
}

function renderScreen(
  snake: [number, number][],
  head: [number, number],
  food: [number, number],
  width: number,
  height: number,
  eating?: boolean
): string {
  const screen: string[][] = [];
  for (let x = 0; x < width; x++) {
    const temp = [];
    for (let y = 0; y < height; y++) {
      temp.push(fields.BG);
    }
    screen.push(temp);
  }
  for (let bodyPart of snake) {
    screen[bodyPart[0]][bodyPart[1]] = fields.BODY;
  }
  screen[food[0]][food[1]] = fields.FOOD;
  screen[head[0]][head[1]] = fields.HEAD;
  if (eating) screen[head[0]][head[1]] = fields.EATING_HEAD;

  let text = "";
  for (let row of screen) {
    for (let item of row) {
      text += item;
    }
    text += "\n";
  }
  return text;
}
function generateFood(
  snake: [number, number][],
  head: [number, number],
  width: number,
  height: number
): [number, number] {
  const allowed: [number, number][] = [];
  for (let x = 1; x < width - 1; x++) {
    for (let y = 1; y < height - 1; y++) {
      let valid = true;
      if (head[0] == x && head[1] == y) valid = false;
      for (let part of snake) {
        if (!valid) break;
        if (part[0] == x && part[1] == y) {
          valid = false;
        }
      }
      if (valid) allowed.push([x, y]);
    }
  }
  let point = allowed[Math.floor(Math.random() * allowed.length)];
  return point;
}
const buttonPressed = new Map<
  string,
  "LEFT" | "RIGHT" | "UP" | "DOWN" | string
>();

export function PressButton(
  member: string,
  button: "LEFT" | "RIGHT" | "UP" | "DOWN" | string
) {
  buttonPressed.set(member, button);
}

export const run: FishyCommandCode = async (client, interaction) => {
  let width = base_width;
  let height = base_height;

  for (let option of interaction.data.options) {
    if (option.name === "height" && typeof option.value === "number")
      height = option.value;
    if (option.name === "width" && typeof option.value === "number")
      width = option.value;
  }
  if (height * width > 800 || height < 4 || width < 4) {
    return interaction.send(
      new ErrorEmbed(
        "Invalid board size",
        "The board can not contain more than 800 units or be less then 4 units tall/wide"
      )
    );
  }

  const snake: [number, number][] = [];
  let head: [number, number] = [Math.floor(width / 2), Math.floor(height / 2)];
  let button = "LEFT";
  let length = 0;

  const gameEmbed = new MessageEmbed().setTimestamp().setColor("GREEN");
  const food = generateFood(snake, head, width, height);
  const screen = renderScreen(snake, head, food, width, height);

  gameEmbed.setDescription(screen);
  interaction.send(gameEmbed, { components: Components(button) });

  const gameLoop = setInterval(async () => {
    let eating = false;
    // Handling movements
    button = buttonPressed.get(interaction.raw_user.id) || button;
    const direction: [number, number] = [0, -1];
    if (button == undefined) {
    } else if (button == "DOWN") {
      direction[0] = 1;
      direction[1] = 0;
    } else if (button == "LEFT") {
      direction[0] = 0;
      direction[1] = -1;
    } else if (button == "UP") {
      direction[0] = -1;
      direction[1] = 0;
    } else if (button == "RIGHT") {
      direction[0] = 0;
      direction[1] = 1;
    }
    const newHead: [number, number] = [
      head[0] + direction[0],
      head[1] + direction[1],
    ];
    // The end of the snake
    snake.push(head);
    head = newHead;
    if (snake.length > length) snake.splice(0, snake.length - length);

    // Fail conditions
    if (head[0] >= width || head[0] < 0 || head[1] >= height || head[1] < 0) {
      gameEmbed.setTitle("GAME OVER, score: " + length).setColor("RED");
      interaction.edit(gameEmbed, { components: [] });
      clearInterval(gameLoop);
      return;
    }
    for (let bodyPart of snake) {
      if (bodyPart[0] === head[0] && bodyPart[1] === head[1]) {
        gameEmbed.setTitle("GAME OVER, score: " + length).setColor("RED");
        interaction.edit(gameEmbed, { components: [] });
        clearInterval(gameLoop);
        return;
      }
    }

    if (head[0] === food[0] && head[1] === food[1]) {
      // Eating logic
      length++;
      eating = true;
      const newFood = generateFood(snake, head, width, height);

      if (!newFood?.[0]) {
        gameEmbed.setTitle("YOU WON!, score: " + length).setColor("YELLOW");
        interaction.edit(gameEmbed, { components: [] });
        clearInterval(gameLoop);
        return;
      }
      food[0] = newFood[0];
      food[1] = newFood[1];
    }

    // Update display
    const screen = renderScreen(snake, head, food, width, height, eating);
    gameEmbed.setDescription(screen);
    gameEmbed.setTitle("SNAKE! score: " + length);
    interaction.edit(gameEmbed, { components: Components(button) });
  }, 1100);
};

export const config: FishyCommandConfig = {
  name: "snake",
  bot_needed: false,
  interaction_options: {
    name: "snake",
    description: "Epic snake game of doom",
    options: [
      {
        name: "height",
        description: "The height of the board",
        type: ApplicationCommandOptionType.INTEGER,
      },
      {
        name: "width",
        description: "The height of the board",
        type: ApplicationCommandOptionType.INTEGER,
      },
    ],
  },
};

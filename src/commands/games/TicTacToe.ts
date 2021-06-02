import { match } from "assert";
import { Message, MessageEmbed } from "discord.js";
import {
  ApplicationCommandOptionType,
  ComponentActionRow,
  ComponentButton,
  ComponentStyle,
  ComponentType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";
import ms from "ms";

const matches = new Map<string, TicTacToeMatchData>();
export interface TicTacToeMatchData {
  board: [
    [number, number, number],
    [number, number, number],
    [number, number, number]
  ];
  turn: string;
  started: number;
}

export const startTTT = (player1: string, player2: string, turn?: string) => {
  matches.set(`${player1}|${player2}`, {
    board: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    turn: turn || player1,
    started: Date.now(),
  });
};

export const getTTT = (player1: string, player2: string) => {
  const match = matches.get(`${player1}|${player2}`);
  if (match && match.started + ms("24 hours") > Date.now()) return match;
  return undefined;
};
export const setTTT = (
  player1: string,
  player2: string,
  board: [
    [number, number, number],
    [number, number, number],
    [number, number, number]
  ],
  turn: string,
  started: number
) => {
  matches.set(`${player1}|${player2}`, { board, turn, started });
};
export const endTTT = (player1: string, player2: string) => {
  matches.delete(`${player1}|${player2}`);
};

export function renderBoard(
  board: [
    [number, number, number],
    [number, number, number],
    [number, number, number]
  ],
  team1: string,
  team2: string,
  ended?: boolean
): ComponentActionRow[] {
  const out: ComponentActionRow[] = [];
  for (let [x, row] of board.entries()) {
    const temp: ComponentButton[] = [];
    for (let [y, item] of row.entries()) {
      if (item === 0)
        temp.push({
          emoji: {
            name: "▪️",
          },
          style: ComponentStyle.Secondary,
          type: ComponentType.Button,
          disabled: ended,
          custom_id: `ttt_game|${team1}|${team2}|${x}|${y}`,
        });
      else if (item === 1) {
        temp.push({
          emoji: {
            name: "❌",
          },
          style: ComponentStyle.Danger,
          disabled: true,
          type: ComponentType.Button,
          custom_id: `ttt_game`,
        });
      } else if (item === 2) {
        temp.push({
          emoji: {
            name: "🟢",
          },
          style: ComponentStyle.Success,
          disabled: true,
          type: ComponentType.Button,
          custom_id: `ttt_game`,
        });
      }
    }
    out.push({ components: temp, type: ComponentType.ActionRow });
  }
  return out;
}
export function checkWin(
  board: [
    [number, number, number],
    [number, number, number],
    [number, number, number]
  ],
  checking: 1 | 2
): boolean {
  let winConditions: [[number, number], [number, number], [number, number]][] =
    [
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ],
      // asdf
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      //
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
    ];

  let won: boolean = false;
  for (let winCondition of winConditions) {
    if (won) break;
    let failed = false;
    for (let button of winCondition) {
      if (failed) break;
      else if (board[button[0]][button[1]] !== checking) failed = true;
    }
    if (!failed) won = true;
  }
  return won;
}
export function checkTie(
  board: [
    [number, number, number],
    [number, number, number],
    [number, number, number]
  ]
): boolean {
  let notTie = false;
  for (let row of board) {
    for (let item of row) {
      if (item === 0) notTie = true;
    }
  }
  return !notTie;
}
export const run: FishyCommandCode = async (client, interaction) => {
  let opponent = interaction.mentions?.users?.first();
  if (opponent) {
    interaction.send(
      new MessageEmbed()
        .setTimestamp()
        .setColor("BLUE")
        .setDescription(
          `**<@${interaction.raw_user.id}> CHALLENGED <@${opponent.id}> in a game of tic tac toe!**\nClick on the button below to accept`
        ),
      {
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                style: ComponentStyle.Primary,
                type: ComponentType.Button,
                label: "Accept",
                custom_id: `ttt_accept|${interaction.raw_user.id}|${opponent.id}`,
              },
            ],
          },
        ],
      }
    );
  } else {
    interaction.send(
      new MessageEmbed()
        .setTimestamp()
        .setColor("BLUE")
        .setDescription(
          `**<@${interaction.raw_user.id}> Wants to play a game of tic tac toe**\nClick on the button below to join!`
        ),
      {
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                style: ComponentStyle.Primary,
                type: ComponentType.Button,
                label: "Join",
                custom_id: `ttt_accept|${interaction.raw_user.id}`,
              },
            ],
          },
        ],
      }
    );
  }
};

export const config: FishyCommandConfig = {
  name: "tic-tac-toe",
  bot_needed: true,
  interaction_options: {
    name: "tic-tac-toe",
    description: "Play the new 3d popular vr online video game tic tac toe",
    options: [
      {
        name: "opponent",
        description: "Who u wanna battle to the death",
        type: ApplicationCommandOptionType.USER,
      },
    ],
  },
};

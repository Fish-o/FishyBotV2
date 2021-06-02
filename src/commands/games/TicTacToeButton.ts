import { MessageEmbed } from "discord.js";
import {
  FishyButtonCommandCode,
  FishyButtonCommandConfig,
} from "fishy-bot-framework/lib/types";
import { PressButton } from "./Snake";
import {
  checkTie,
  checkWin,
  endTTT,
  getTTT,
  renderBoard,
  setTTT,
  startTTT,
} from "./TicTacToe";

export const run: FishyButtonCommandCode = async (client, interaction) => {
  await interaction.deferButton();

  const custom_id = interaction.customID;
  const data = custom_id.slice(config.custom_id.length).split("|");
  const action = data.shift();
  if (action === "accept") {
    const user1 = data.shift();
    if (!user1) return interaction.send("ERROR 383329443 #1");
    if (user1 === interaction.raw_user.id) return;
    const user2 = data.shift() || interaction.raw_user.id;
    if (user2 !== interaction.raw_user.id) return;
    startTTT(interaction.raw_user.id, user1);

    let board: [
      [number, number, number],
      [number, number, number],
      [number, number, number]
    ] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    interaction.edit(
      new MessageEmbed()
        .setDescription(
          `**TicTacToe**\n|<@${interaction.raw_user.id}>| vs  <@${user1}> `
        )
        .setColor("RED")
        .setTimestamp(),
      { components: renderBoard(board, interaction.raw_user.id, user1) }
    );
  } else if (action === "game") {
    const player1 = data.shift();
    const player2 = data.shift();
    const x = data.shift();
    const y = data.shift();
    if (!player1 || !player2 || !x || !y)
      return console.log("@*&@#!*&{:>::{<{:{:>{:?:>{:>");
    const match = getTTT(player1, player2);
    if (!match) return console.log("@*&@#!*&asdfadfasdfasdfasdfasdfasdf");
    if (match.turn !== interaction.raw_user.id)
      return console.log("@*&@#!*&73817348917438971029847129384710289347");
    const board = match.board;
    const playerNumber = interaction.raw_user.id === player1 ? 1 : 2;
    board[Number.parseInt(x)][Number.parseInt(y)] = playerNumber;

    if (checkWin(board, playerNumber)) {
      interaction.edit(
        new MessageEmbed()
          .setDescription(
            `**TicTacToe - <@${interaction.raw_user.id}> won!**\n${
              interaction.raw_user.id === player1
                ? `🎉<@${player1}>🎉 vs <@${player2}>`
                : `<@${player1}> vs 🎉<@${player2}>🎉`
            } `
          )
          .setTimestamp()
          .setColor(`${interaction.raw_user.id === player1 ? "RED" : "GREEN"}`),
        { components: renderBoard(board, player1, player2, true) }
      );
      endTTT(player1, player2);
      return;
    } else if (checkTie(board)) {
      interaction.edit(
        new MessageEmbed()
          .setDescription(
            `**TicTacToe TIED**\n${
              interaction.raw_user.id === player1
                ? `<@${player1}> vs <@${player2}>`
                : `<@${player1}> vs <@${player2}>`
            } `
          )
          .setColor(`YELLOW`)
          .setTimestamp(),
        { components: renderBoard(board, player1, player2, true) }
      );
      endTTT(player1, player2);
      return;
    }

    setTTT(
      player1,
      player2,
      board,
      interaction.raw_user.id === player1 ? player2 : player1,
      match.started
    );
    interaction.edit(
      new MessageEmbed()
        .setDescription(
          `**TicTacToe**\n${
            interaction.raw_user.id === player1
              ? `<@${player1}> vs |<@${player2}>|`
              : `|<@${player1}>| vs <@${player2}>`
          } `
        )
        .setColor(`${interaction.raw_user.id === player1 ? "GREEN" : "RED"}`)
        .setTimestamp(),
      { components: renderBoard(board, player1, player2) }
    );
  }
};

export const config: FishyButtonCommandConfig = {
  custom_id: "ttt_",
  user_perms: [],
  atStart: true,
  bot_needed: true,
};

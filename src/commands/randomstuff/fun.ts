import axios from "axios";
import { Message, MessageEmbed } from "discord.js";
import {
  ApplicationCommandOptionType,
  FishyCommandCode,
  FishyCommandConfig,
} from "fishy-bot-framework/lib/types";
import { ErrorEmbed } from "fishy-bot-framework/lib/utils/Embeds";

const DOG_API_URL = "https://api.thedogapi.com/";
const CAT_API_URL = "https://api.thecatapi.com/";
async function fetchAnimal(
  base: string,
  key: string,
  user_id?: string
): Promise<string> {
  var headers = {
    "X-API-KEY": key,
  };
  var query_params = {
    has_breeds: true, // we only want images with at least one breed data object - name, temperament etc
    mime_types: "jpg,png", // we only want static images as Discord doesn't like gifs
    size: "medium", // get the small images as the size is prefect for Discord's 390x256 limit
    sub_id: user_id, // pass the message senders username so you can see how many images each user has asked for in the stats
    limit: 1, // only need one
  };
  try {
    // construct the API Get request url
    const _url = base + `v1/images/search`;
    // make the request passing the url, and headers object which contains the API_KEY
    const response = await axios.get(_url, {
      params: query_params,
      headers: headers,
    });
    console.log(response.data);
    return response.data[0].url;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export const run: FishyCommandCode = async (client, interaction) => {
  const main_command = interaction.data.options[0].name;
  if (!main_command) {
    return interaction.sendSilent("You broke shit again and >:(");
  }
  if (main_command === "animals") {
    let animal_type = interaction.data.options[0].options?.[0].value;
    if (!animal_type) {
      return interaction.sendSilent("Please enter an animal type");
    }
    const embed = new MessageEmbed();
    embed.setColor("#15f153");
    embed.setTimestamp();
    if (animal_type == "animal_dog") {
      const img = await fetchAnimal(
        DOG_API_URL,
        process.env.DOG_API_KEY!,
        interaction.raw_member?.user?.id
      );
      embed.setDescription("_dog located_ :dog:");
      embed.setImage(img);
    } else if (animal_type == "animal_cat") {
      const img = await fetchAnimal(
        CAT_API_URL,
        process.env.CAT_API_KEY!,
        interaction.raw_member?.user?.id
      );
      embed.setDescription(`Oh look i found a cat :cat:`);
      embed.setImage(img);
    }
    interaction.send(embed);
  } else if (main_command === "random") {
    const type = interaction.data.options[0]?.options?.[0].name;
    if (!type) return interaction.sendSilent("Wrong type");
    if (type === "coin") {
      const randomIndex = Math.floor(Math.random() * 2);
      const edge = Math.floor(Math.random() * 100);
      if (edge == 69) {
        interaction.send(`<@${interaction.raw_member?.user?.id}> edge`);
      } else {
        interaction.send(
          `<@${interaction.raw_member?.user?.id}> ${
            ["heads", "tails"][randomIndex]
          }`
        );
      }
    } else if (type === "dice") {
      const sides = Number.parseInt(
        `${
          interaction.data.options[0]?.options?.[0].options?.find(
            (option) => option.name === "sides"
          )?.value || "6"
        }` || "6"
      );
      const diceces = Number.parseInt(
        `${
          interaction.data.options[0].options?.[0].options?.find(
            (option) => option.name === "amount"
          )?.value || "1"
        }` || "1"
      );
      if (sides > 1000000000) {
        return interaction.send(
          new ErrorEmbed("You surpassed the 1000000000 side limit")
        );
      } else if (diceces > 25) {
        return interaction.send(
          new ErrorEmbed("You surpassed the 25 dice limit")
        );
      }
      const embed = new MessageEmbed();
      embed.setColor("RANDOM");
      embed.setTitle(`Throwing ${diceces} ${sides}-sided dice..`);
      for (let dice = 1; dice <= diceces; dice++) {
        const number = Math.floor(Math.random() * sides) + 1;
        embed.addField(`Dice #${dice}`, `${number}/${sides}`, true);
      }
      embed.setTimestamp();
      interaction.send(embed);
    } else if (type === "8ball") {
      interaction.send("no"); // TODO: add this
    }
  } else if (main_command === "fact") {
    let res = await axios.get(
      `https://uselessfacts.jsph.pl/random.json?language=en`
    );
    interaction.send(res.data.text);
  }
};

export const config: FishyCommandConfig = {
  name: "fun",
  bot_needed: false,
  interaction_options: {
    name: "fun",
    description: "Fun commands!",
    options: [
      {
        name: "animals",
        description: "Wanna see a cute doggo?! (or cat)",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "animal",
            description: "The type of animal",
            type: ApplicationCommandOptionType.STRING,
            required: true,
            choices: [
              {
                name: "Dog",
                value: "animal_dog",
              },
              {
                name: "Cat",
                value: "animal_cat",
              },
            ],
          },
        ],
      },
      {
        name: "random",
        description: "Daily dose of randomness!",
        type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
        options: [
          {
            name: "dice",
            description: "Roll a dice",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [
              {
                name: "sides",
                description: "The amount of sides the dice has",
                type: ApplicationCommandOptionType.INTEGER,
              },
              {
                name: "amount",
                description: "The amount of dice to throw",
                type: ApplicationCommandOptionType.INTEGER,
              },
            ],
          },
          {
            name: "coin",
            description: "Flip a coin",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [],
          },
          {
            name: "8ball",
            description: "Ask the magic 8ball",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [
              {
                name: "Question",
                description: "The question to to the 8ball",
                type: ApplicationCommandOptionType.STRING,
                required: true,
              },
            ],
          },
        ],
      },
      {
        name: "fact",
        description: "(might not actually be true) :D",
        type: ApplicationCommandOptionType.SUB_COMMAND,
      },
    ],
  },
};

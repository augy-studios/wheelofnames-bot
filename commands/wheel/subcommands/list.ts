import {
  type ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
  AttachmentBuilder
} from 'discord.js';
import { getSpinAnimation, type WheelConfig, type WheelEntry } from '../../../wheel-of-names-api-util.ts';
import { themeDictionary, themeList } from '../colorThemes.ts';

export const MAX_SPIN_TIME = 30;

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('Create a wheel using a list of entries')
    .addStringOption((o) =>
      o
        .setName('entries')
        .setDescription('The entries on the wheel, separated by commas')
        .setRequired(true)
        .setMaxLength(1500)
    )
    .addStringOption((o) =>
      o
        .setName('theme')
        .setDescription('The color theme of the wheel')
        .addChoices(...themeList)
    )
    .addStringOption((o) =>
      o
        .setName('spoilertag')
        .setDescription('Spoiler tag the winner (default OFF)')
        .addChoices({ name: 'ON', value: 'ON' }, { name: 'OFF', value: 'OFF' })
    )
    .addStringOption((o) =>
      o
        .setName('shuffle')
        .setDescription('Shuffle the entries before spinning')
        .addChoices({ name: 'ON', value: 'ON' }, { name: 'OFF', value: 'OFF' })
    )
    .addStringOption((o) =>
      o
        .setName('backgroundcolor')
        .setDescription('One-word color name (e.g. skyblue) or hex code (default white)')
    )
    .addIntegerOption((o) =>
      o
        .setName('spintime')
        .setDescription(`Spin duration in seconds (default 3, max ${MAX_SPIN_TIME})`)
        .setMinValue(3)
        .setMaxValue(MAX_SPIN_TIME)
    )
    .addStringOption((o) =>
      o
        .setName('loop')
        .setDescription('Loop the wheel spin animation (default ON)')
        .addChoices({ name: 'ON', value: 'ON' }, { name: 'OFF', value: 'OFF' })
    )
    .addStringOption((o) =>
      o
        .setName('winnermessage')
        .setDescription('The message to display when a winner is chosen')
        .setMinLength(1)
        .setMaxLength(100)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const entriesString = interaction.options.getString('entries', true);
    const entries = parseEntries(entriesString);
    if (entries.length === 0) throw new Error('You must input at least one entry');

    await interaction.deferReply();

    const wheelConfig = buildWheelConfig(interaction);
    wheelConfig.entries = entries;

    const { animation, imageFormat, winner } = await getSpinAnimation(wheelConfig);
    const file = new AttachmentBuilder(animation, { name: `wheel.${imageFormat}` });
    const winnerDisplay = formatWinner(winner, interaction.options.getString('spoilertag') === 'ON');
    await interaction.editReply({ content: `The winner is: ${winnerDisplay}`, files: [file] });
  }
};

export function parseEntries(input: string): WheelEntry[] {
  const raw = input.includes(',') ? input.split(',') : input.split(/\s+/);
  const entries: WheelEntry[] = [];
  for (const part of raw) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]!, 10);
      const end = parseInt(rangeMatch[2]!, 10);
      const [lo, hi] = start <= end ? [start, end] : [end, start];
      for (let i = lo; i <= hi; i++) entries.push({ text: String(i) });
    } else {
      entries.push({ text: trimmed });
    }
  }
  return entries;
}

export function buildWheelConfig(interaction: ChatInputCommandInteraction): WheelConfig {
  const config: WheelConfig = { entries: [] };

  const theme = interaction.options.getString('theme');
  if (theme && themeDictionary[theme]) {
    config.colorSettings = { colors: themeDictionary[theme] };
  }

  const bgColor = interaction.options.getString('backgroundcolor');
  if (bgColor) config.pageBackgroundColor = bgColor;

  const spinTime = interaction.options.getInteger('spintime');
  if (spinTime) config.spinTime = spinTime;

  const shuffle = interaction.options.getString('shuffle');
  if (shuffle === 'ON') config.shuffleEntries = true;

  if (interaction.options.getString('loop') === 'OFF') config.loop = false;

  const winnerMessage = interaction.options.getString('winnermessage');
  if (winnerMessage) config.winnerMessage = winnerMessage;

  return config;
}

export function formatWinner(winner: WheelEntry, spoilerTag: boolean): string {
  const display = winner.discordId ? `${winner.discordId} (${winner.text})` : winner.text;
  return spoilerTag ? `||${display}||` : display;
}

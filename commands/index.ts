import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import wheel from './wheel/index.ts';
import help from './help.ts';

const commands: Record<
  string,
  {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<any>;
  }
> = {
  wheel,
  help
};

export default commands;

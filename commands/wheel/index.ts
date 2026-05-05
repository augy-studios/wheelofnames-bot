import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  MessageFlags
} from 'discord.js';
import list from './subcommands/list.ts';
import members from './subcommands/members.ts';
import reactions from './subcommands/reactions.ts';
import help from './subcommands/help.ts';

const subcommands = { list, members, reactions, help };

export default {
  data: new SlashCommandBuilder()
    .setName('wheel')
    .setDescription('Spin a wheel with the Wheel of Names API')
    .addSubcommand(list.data)
    .addSubcommand(members.data)
    .addSubcommand(reactions.data)
    .addSubcommand(help.data),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommandName = interaction.options.getSubcommand(true);
    const subcommand = subcommands[subcommandName as keyof typeof subcommands];
    if (!subcommand) {
      await interaction.reply({
        content: `Unknown subcommand: ${subcommandName}`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    await subcommand.execute(interaction);
  }
};

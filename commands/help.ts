import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType
} from 'discord.js';

const ITEMS_PER_PAGE = 3;

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all available bot commands'),

  async execute(interaction: ChatInputCommandInteraction) {
    const appCommands = await interaction.client.application.commands.fetch();
    const wheelCmd = appCommands.find((c) => c.name === 'wheel');
    const helpCmd = appCommands.find((c) => c.name === 'help');

    const wheelId = wheelCmd?.id ?? '0';
    const helpId = helpCmd?.id ?? '0';

    const items = [
      {
        name: `</wheel list:${wheelId}>`,
        value: 'Spin a wheel with a custom list of entries (comma-separated). Supports number ranges like `1-10`.'
      },
      {
        name: `</wheel members:${wheelId}>`,
        value: 'Spin a wheel of server members. Optionally filter by role.'
      },
      {
        name: `</wheel reactions:${wheelId}>`,
        value: 'Spin a wheel of users who reacted to a message. Provide a message link.'
      },
      {
        name: `</wheel help:${wheelId}>`,
        value: 'Get detailed help on a specific topic (options, subcommands, etc.).'
      },
      {
        name: `</help:${helpId}>`,
        value: 'Show this command list.'
      }
    ];

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    let page = 0;

    const buildEmbed = (p: number) => {
      const start = p * ITEMS_PER_PAGE;
      const pageItems = items.slice(start, start + ITEMS_PER_PAGE);
      return new EmbedBuilder()
        .setTitle('Bot Commands')
        .setDescription('All available commands:')
        .addFields(pageItems.map((item) => ({ name: item.name, value: item.value })))
        .setFooter({ text: `Page ${p + 1} of ${totalPages}` })
        .setColor(0x5865f2);
    };

    const buildRow = (p: number) =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀ Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(p === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next ▶')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(p >= totalPages - 1)
      );

    const reply = await interaction.reply({
      embeds: [buildEmbed(page)],
      components: totalPages > 1 ? [buildRow(page)] : [],
      withResponse: true
    });

    if (totalPages <= 1) return;

    const collector = reply.resource!.message!.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120_000
    });

    collector.on('collect', async (btn) => {
      await btn.deferUpdate();
      if (btn.customId === 'prev') page = Math.max(0, page - 1);
      if (btn.customId === 'next') page = Math.min(totalPages - 1, page + 1);
      await btn.editReply({ embeds: [buildEmbed(page)], components: [buildRow(page)] });
    });

    collector.on('end', async () => {
      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀ Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next ▶')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
      );
      await interaction.editReply({ components: [disabledRow] }).catch(() => null);
    });
  }
};

import { type ChatInputCommandInteraction, SlashCommandSubcommandBuilder, MessageFlags } from 'discord.js';
import { MAX_SPIN_TIME } from './list.ts';

const helpTopics: Record<string, string> = {
  general: `**Wheel of Names Bot**\nSpin a wheel and get a random winner!\n\nMain command: \`/wheel\`\nSubcommands: \`list\`, \`members\`, \`reactions\`, \`help\`\n\nUse \`/wheel help topic:commands\` for a description of each subcommand.`,
  commands: `**Commands**\n- \`/wheel list\` — Spin a wheel with a custom list of entries\n- \`/wheel members\` — Spin a wheel of server members\n- \`/wheel reactions\` — Spin a wheel of users who reacted to a message\n- \`/wheel help\` — Show help for the bot`,
  list: `**\`/wheel list\`**\nProvide entries separated by commas (or spaces if no commas).\nSupports number ranges, e.g. \`1-10\`.\nExample: \`/wheel list entries:apple, banana, cherry\``,
  members: `**\`/wheel members\`**\nSpins a wheel of all non-bot members in the server.\nOptionally filter by role using the \`role\` option.\nExample: \`/wheel members role:@Contestant\``,
  reactions: `**\`/wheel reactions\`**\nProvide a message link and the bot will spin a wheel of everyone who reacted to it.\nThe message must be in the same server.\nExample: \`/wheel reactions messagelink:https://discord.com/channels/...\``,
  options: `**Shared Options**\n- \`theme\` — Color theme of the wheel\n- \`spoilertag\` — Hide the winner behind a spoiler tag\n- \`shuffle\` — Shuffle entries before spinning (list only)\n- \`backgroundcolor\` — CSS color name or hex code\n- \`spintime\` — Duration in seconds (3–${MAX_SPIN_TIME})\n- \`loop\` — Loop the animation\n- \`winnermessage\` — Custom text shown with the winner`
};

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('help')
    .setDescription('Learn about the bot and how to use it')
    .addStringOption((o) =>
      o
        .setName('topic')
        .setDescription('The topic to get help on')
        .addChoices(
          ...Object.keys(helpTopics).map((key) => ({ name: key, value: key }))
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const topic = interaction.options.getString('topic') ?? 'general';
    const text = helpTopics[topic] ?? helpTopics['general']!;
    await interaction.reply({ content: text, flags: MessageFlags.Ephemeral });
  }
};

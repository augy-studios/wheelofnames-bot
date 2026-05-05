import {
  type ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
  AttachmentBuilder,
  type TextBasedChannel,
  type User,
  type MessageReaction
} from 'discord.js';
import { getSpinAnimation } from '../../../wheel-of-names-api-util.ts';
import { themeList } from '../colorThemes.ts';
import { buildWheelConfig, formatWinner, MAX_SPIN_TIME } from './list.ts';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('reactions')
    .setDescription('Create a wheel of people who reacted to a message')
    .addStringOption((o) =>
      o
        .setName('messagelink')
        .setDescription('The link to the message to get reactions from')
        .setRequired(true)
        .setMinLength(8)
        .setMaxLength(100)
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
    if (!interaction.inGuild()) throw new Error('This command must be used in a server');

    const messageLink = interaction.options.getString('messagelink', true);
    const { guildId, channelId, messageId } = parseMessageLink(messageLink);

    if (!messageId) throw new Error('Invalid message link');
    if (guildId && guildId !== '@me' && guildId !== interaction.guildId) {
      throw new Error('The message must be in this server');
    }

    const resolvedChannelId = channelId ?? interaction.channelId;
    const channel = await interaction.client.channels.fetch(resolvedChannelId).catch(() => null);
    if (!channel || !channel.isTextBased()) throw new Error('The channel was not found');

    const message = await (channel as TextBasedChannel).messages
      .fetch(messageId)
      .catch(() => null);
    if (!message) throw new Error('The message was not found');
    if (message.reactions.cache.size === 0) throw new Error('The message has no reactions');

    await interaction.deferReply();

    const allUsers: User[] = [];
    for (const reaction of message.reactions.cache.values()) {
      const users = await fetchAllReactionUsers(reaction);
      allUsers.push(...users);
    }

    const uniqueUsers = deduplicateUsers(allUsers.filter((u) => !u.bot));
    if (uniqueUsers.length === 0) throw new Error('No non-bot users reacted to this message');

    const wheelConfig = buildWheelConfig(interaction);
    wheelConfig.entries = uniqueUsers.map((u) => ({
      text: u.globalName ?? u.username,
      discordId: `<@${u.id}>`
    }));

    const { animation, imageFormat, winner } = await getSpinAnimation(wheelConfig);
    const file = new AttachmentBuilder(animation, { name: `wheel.${imageFormat}` });
    const winnerDisplay = formatWinner(winner, interaction.options.getString('spoilertag') === 'ON');
    await interaction.editReply({ content: `The winner is: ${winnerDisplay}`, files: [file] });
  }
};

function parseMessageLink(link: string): {
  guildId: string | undefined;
  channelId: string | undefined;
  messageId: string | undefined;
} {
  const matches = link.match(/(\d{16,22}|@me)/g);
  return {
    guildId: matches?.at(-3),
    channelId: matches?.at(-2),
    messageId: matches?.at(-1)
  };
}

async function fetchAllReactionUsers(reaction: MessageReaction): Promise<User[]> {
  const users: User[] = [];
  let afterId: string | undefined;
  while (true) {
    const options = afterId ? { limit: 100, after: afterId } : { limit: 100 };
    const batch = await reaction.users.fetch(options);
    users.push(...batch.values());
    if (batch.size < 100) break;
    afterId = batch.last()?.id;
  }
  return users;
}

function deduplicateUsers(users: User[]): User[] {
  const seen = new Set<string>();
  return users.filter((u) => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

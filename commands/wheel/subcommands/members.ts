import {
  type ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
  AttachmentBuilder,
  type GuildMember
} from 'discord.js';
import { getSpinAnimation } from '../../../wheel-of-names-api-util.ts';
import { themeList } from '../colorThemes.ts';
import { buildWheelConfig, formatWinner, MAX_SPIN_TIME } from './list.ts';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('members')
    .setDescription('Create a wheel of server members')
    .addRoleOption((o) =>
      o.setName('role').setDescription('The role to select users from')
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

    const guild = interaction.guild ?? await interaction.client.guilds.fetch(interaction.guildId!);
    await interaction.deferReply();

    const role = interaction.options.getRole('role');
    let members: GuildMember[];

    if (role) {
      await guild.members.fetch();
      const roleObj = await guild.roles.fetch(role.id);
      if (!roleObj) throw new Error('The role was not found');

      if (roleObj.name === '@everyone') {
        members = filterBots([...guild.members.cache.values()]);
      } else {
        const roleMembers = [...guild.members.cache.values()].filter((m) =>
          m.roles.cache.has(role.id)
        );
        const nonBots = filterBots(roleMembers);
        if (nonBots.length === 0) {
          if (roleMembers.length === 0) throw new Error(`No members found with the role "${roleObj.name}"`);
          members = roleMembers;
        } else {
          members = nonBots;
        }
      }
    } else {
      await guild.members.fetch();
      members = filterBots([...guild.members.cache.values()]);
    }

    if (members.length === 0) throw new Error('No eligible members found');

    const wheelConfig = buildWheelConfig(interaction);
    wheelConfig.entries = shuffleArray(
      members.map((m) => ({
        text: m.nickname ?? m.user.globalName ?? m.user.username,
        discordId: `<@${m.user.id}>`
      }))
    );

    const { animation, imageFormat, winner } = await getSpinAnimation(wheelConfig);
    const file = new AttachmentBuilder(animation, { name: `wheel.${imageFormat}` });
    const winnerDisplay = formatWinner(winner, interaction.options.getString('spoilertag') === 'ON');
    await interaction.editReply({ content: `The winner is: ${winnerDisplay}`, files: [file] });
  }
};

function filterBots(members: GuildMember[]): GuildMember[] {
  return members.filter((m) => !m.user.bot);
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

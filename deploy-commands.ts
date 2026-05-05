import { env } from 'node:process';
import { REST, Routes } from 'discord.js';
import commands from './commands/index.ts';

const { DISCORD_TOKEN } = env;
if (!DISCORD_TOKEN) throw Error('DISCORD_TOKEN not set!');

const clientId = Buffer.from(DISCORD_TOKEN.split('.')[0], 'base64').toString('ascii');

const rest = new REST().setToken(DISCORD_TOKEN);

const body = Object.values(commands).map(({ data }) => data.toJSON());

const { DISCORD_GUILD_ID } = env;

const route = DISCORD_GUILD_ID
  ? Routes.applicationGuildCommands(clientId, DISCORD_GUILD_ID)
  : Routes.applicationCommands(clientId);

console.log(DISCORD_GUILD_ID ? `Deploying commands to guild ${DISCORD_GUILD_ID}...` : 'Deploying commands globally...');

await rest.put(route, { body });

console.log(`Successfully deployed ${body.length} commands!`);

import { env } from 'node:process';
import { REST, Routes } from 'discord.js';
import commands from './commands/index.ts';

const { DISCORD_TOKEN } = env;
if (!DISCORD_TOKEN) throw Error('DISCORD_TOKEN not set!');

const clientId = Buffer.from(DISCORD_TOKEN.split('.')[0], 'base64').toString('ascii');

const rest = new REST().setToken(DISCORD_TOKEN);

const body = Object.values(commands).map(({ data }) => data.toJSON());

console.log('Deploying commands...');

await rest.put(Routes.applicationCommands(clientId), { body });

console.log(`Successfully deployed ${body.length} commands!`);

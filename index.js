const { token, clientId } = require('./config.json');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');

const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
	intents: [GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates],
});

// Load all commands
const commands = [];
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
	commands.push(command.data.toJSON());
}

client.player = new Player(client, {
	ytdlOptions: {
		quality: 'highestaudio',
		highWaterMark: 1 << 25,
	},
});

client.on('ready', () => {
	const guild_ids = client.guilds.cache.map(guild => guild.id);

	const rest = new REST({ version: '10' }).setToken(token);
	for (const guildId of guild_ids) {
		rest.put(Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands })
			.then(() => console.log(`Added commands to ${guildId}`))
			.catch(console.error);
	}
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute({ client, interaction });
	}
	catch (error) {
		console.error(error);
		await interaction.editReply({ content: 'An error occurred while executing that command.' });
	}
});

client.login(token);
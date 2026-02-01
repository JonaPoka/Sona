// Modular Discord bot base
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates
	] 
});
client.commands = new Collection();


// Load slash commands
const commands = [];
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(path.join(__dirname, 'commands', folder, file));
		if (command.data && command.execute) {
			client.commands.set(command.data.name, command);
			commands.push(command.data.toJSON());
		}
	}
}

// Register slash commands
const rest = new REST({ version: '10' }).setToken(config.token);
client.once('ready', async () => {
	try {
		// Register commands for a specific guild (for dev)
		if (config.guildId) {
			await rest.put(
				Routes.applicationGuildCommands(client.user.id, config.guildId),
				{ body: commands }
			);
			console.log('Slash commands registered (guild)');
		} else {
			await rest.put(
				Routes.applicationCommands(client.user.id),
				{ body: commands }
			);
			console.log('Slash commands registered (global)');
		}
	} catch (error) {
		console.error('Error registering slash commands:', error);
	}
	console.log(`Logged in as ${client.user.tag}`);
});

// Load listeners
const listenersPath = path.join(__dirname, 'listeners');
if (fs.existsSync(listenersPath)) {
	const listenerFiles = fs.readdirSync(listenersPath).filter(file => file.endsWith('.js'));
	for (const file of listenerFiles) {
		const event = require(path.join(listenersPath, file));
		if (event.name && event.execute) {
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args, client));
			} else {
				client.on(event.name, (...args) => event.execute(...args, client));
			}
		}
	}
}

// Basic ready event fallback
client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});


// Slash command handler
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
	}
});

client.login(config.token);

const { SlashCommandBuilder } = require('discord.js');
const musicManager = require('../../musicManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resume')
		.setDescription('Resume the paused song'),
	
	async execute(interaction, client) {
		const member = interaction.member;
		const voiceChannel = member.voice.channel;

		if (!voiceChannel) {
			return interaction.reply({ content: '❌ You need to be in a voice channel!', ephemeral: true });
		}

		const queue = musicManager.getQueue(interaction.guildId);
		if (!queue) {
			return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
		}

		if (musicManager.resume(interaction.guildId)) {
			return interaction.reply('▶️ Resumed the music!');
		} else {
			return interaction.reply({ content: '❌ Failed to resume the music!', ephemeral: true });
		}
	},
};

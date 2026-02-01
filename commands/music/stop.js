const { SlashCommandBuilder } = require('discord.js');
const musicManager = require('../../musicManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop playing music and clear the queue'),
	
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

		if (musicManager.stop(interaction.guildId)) {
			return interaction.reply('⏹️ Stopped the music and cleared the queue!');
		} else {
			return interaction.reply({ content: '❌ Failed to stop the music!', ephemeral: true });
		}
	},
};

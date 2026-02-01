const { SlashCommandBuilder } = require('discord.js');
const musicManager = require('../../musicManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause the current song'),
	
	async execute(interaction, client) {
		const member = interaction.member;
		const voiceChannel = member.voice.channel;

		if (!voiceChannel) {
			return interaction.reply({ content: '❌ You need to be in a voice channel!', ephemeral: true });
		}

		const queue = musicManager.getQueue(interaction.guildId);
		if (!queue || !queue.isPlaying) {
			return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
		}

		if (musicManager.pause(interaction.guildId)) {
			return interaction.reply('⏸️ Paused the music!');
		} else {
			return interaction.reply({ content: '❌ Failed to pause the music!', ephemeral: true });
		}
	},
};

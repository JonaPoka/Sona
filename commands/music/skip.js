const { SlashCommandBuilder } = require('discord.js');
const musicManager = require('../../musicManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip to the next song in queue'),
	
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

		if (queue.songs.length <= 1) {
			return interaction.reply({ content: '❌ No more songs in the queue!', ephemeral: true });
		}

		if (musicManager.skip(interaction.guildId)) {
			return interaction.reply('⏭️ Skipped to the next song!');
		} else {
			return interaction.reply({ content: '❌ Failed to skip the song!', ephemeral: true });
		}
	},
};

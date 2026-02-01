const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../../musicManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nowplaying')
		.setDescription('Show the currently playing song'),
	
	async execute(interaction, client) {
		const queue = musicManager.getQueue(interaction.guildId);
		
		if (!queue || queue.songs.length === 0) {
			return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
		}

		const song = queue.songs[0];
		const embed = new EmbedBuilder()
			.setColor('#FF0000')
			.setTitle('🎵 Now Playing')
			.setDescription(`[${song.title}](${song.url})`)
			.addFields(
				{ name: 'Duration', value: song.duration, inline: true },
				{ name: 'Channel', value: song.author, inline: true },
				{ name: 'Remaining', value: `${queue.songs.length - 1} songs`, inline: true }
			)
			.setThumbnail(song.thumbnail)
			.setTimestamp();

		return interaction.reply({ embeds: [embed] });
	},
};

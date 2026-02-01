const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../../musicManager');
const ytdl = require('ytdl-core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a song from YouTube')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('YouTube URL or search query')
				.setRequired(true)),
	
	async execute(interaction, client) {
		await interaction.deferReply();

		const query = interaction.options.getString('query');
		const member = interaction.member;
		const voiceChannel = member.voice.channel;

		// Check if user is in a voice channel
		if (!voiceChannel) {
			return interaction.editReply('❌ You need to be in a voice channel to play music!');
		}

		// Check bot permissions
		const permissions = voiceChannel.permissionsFor(interaction.client.user);
		if (!permissions.has('Connect') || !permissions.has('Speak')) {
			return interaction.editReply('❌ I need permissions to join and speak in your voice channel!');
		}

		try {
			let song;

			// Check if it's a YouTube URL
			if (ytdl.validateURL(query)) {
				song = await musicManager.getVideoInfo(query);
			} else {
				// Search YouTube
				song = await musicManager.searchYouTube(query);
			}

			if (!song) {
				return interaction.editReply('❌ Could not find any songs matching your query!');
			}

			const queue = musicManager.getQueue(interaction.guildId);
			const position = await musicManager.addSong(interaction.guildId, song);

			const embed = new EmbedBuilder()
				.setColor('#00FF00')
				.setTitle('🎵 Added to Queue')
				.setDescription(`[${song.title}](${song.url})`)
				.addFields(
					{ name: 'Duration', value: song.duration, inline: true },
					{ name: 'Channel', value: song.author, inline: true },
					{ name: 'Position', value: `${position}`, inline: true }
				)
				.setThumbnail(song.thumbnail)
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] });

			// Start playing if not already playing
			if (!queue || !queue.isPlaying) {
				await musicManager.play(interaction.guildId, voiceChannel, interaction.channel);
			}

		} catch (error) {
			console.error('Play command error:', error);
			return interaction.editReply('❌ An error occurred while trying to play the song!');
		}
	},
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../../musicManager');

const MAX_DISPLAYED_SONGS = 10;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Show the current music queue'),
	
	async execute(interaction, client) {
		const queue = musicManager.getQueue(interaction.guildId);
		
		if (!queue || queue.songs.length === 0) {
			return interaction.reply({ content: '❌ The queue is empty!', ephemeral: true });
		}

		const embed = new EmbedBuilder()
			.setColor('#0099FF')
			.setTitle('🎵 Music Queue')
			.setTimestamp();

		// Show up to MAX_DISPLAYED_SONGS in the queue
		const queueList = queue.songs.slice(0, MAX_DISPLAYED_SONGS).map((song, index) => {
			const prefix = index === 0 ? '🎶 **Now Playing:**' : `${index}.`;
			return `${prefix} [${song.title}](${song.url}) \`[${song.duration}]\``;
		}).join('\n');

		embed.setDescription(queueList);

		if (queue.songs.length > MAX_DISPLAYED_SONGS) {
			embed.setFooter({ text: `And ${queue.songs.length - MAX_DISPLAYED_SONGS} more songs...` });
		} else {
			embed.setFooter({ text: `Total songs: ${queue.songs.length}` });
		}

		return interaction.reply({ embeds: [embed] });
	},
};

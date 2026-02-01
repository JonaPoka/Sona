const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../../musicManager');

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

		// Show up to 10 songs in the queue
		const queueList = queue.songs.slice(0, 10).map((song, index) => {
			const prefix = index === 0 ? '🎶 **Now Playing:**' : `${index}.`;
			return `${prefix} [${song.title}](${song.url}) \`[${song.duration}]\``;
		}).join('\n');

		embed.setDescription(queueList);

		if (queue.songs.length > 10) {
			embed.setFooter({ text: `And ${queue.songs.length - 10} more songs...` });
		} else {
			embed.setFooter({ text: `Total songs: ${queue.songs.length}` });
		}

		return interaction.reply({ embeds: [embed] });
	},
};

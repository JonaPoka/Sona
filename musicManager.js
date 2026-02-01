const { 
	createAudioPlayer, 
	createAudioResource, 
	joinVoiceChannel, 
	AudioPlayerStatus,
	VoiceConnectionStatus,
	entersState
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytsearch = require('yt-search');

class MusicManager {
	constructor() {
		this.queues = new Map();
	}

	getQueue(guildId) {
		return this.queues.get(guildId);
	}

	createQueue(guildId) {
		if (!this.queues.has(guildId)) {
			this.queues.set(guildId, {
				songs: [],
				player: createAudioPlayer(),
				connection: null,
				textChannel: null,
				isPlaying: false,
				volume: 1.0
			});
		}
		return this.queues.get(guildId);
	}

	async addSong(guildId, song) {
		const queue = this.createQueue(guildId);
		queue.songs.push(song);
		return queue.songs.length;
	}

	async play(guildId, voiceChannel, textChannel) {
		const queue = this.getQueue(guildId);
		if (!queue || queue.songs.length === 0) {
			return;
		}

		queue.textChannel = textChannel;
		const song = queue.songs[0];

		try {
			// Join voice channel if not connected
			if (!queue.connection) {
				queue.connection = joinVoiceChannel({
					channelId: voiceChannel.id,
					guildId: guildId,
					adapterCreator: voiceChannel.guild.voiceAdapterCreator,
				});

				queue.connection.on(VoiceConnectionStatus.Disconnected, async () => {
					try {
						await Promise.race([
							entersState(queue.connection, VoiceConnectionStatus.Signalling, 5_000),
							entersState(queue.connection, VoiceConnectionStatus.Connecting, 5_000),
						]);
					} catch (error) {
						queue.connection.destroy();
						this.queues.delete(guildId);
					}
				});

				queue.connection.subscribe(queue.player);
			}

			// Create audio stream
			const stream = ytdl(song.url, {
				filter: 'audioonly',
				quality: 'highestaudio',
				highWaterMark: 1 << 25
			});

			const resource = createAudioResource(stream, {
				inlineVolume: true
			});

			if (resource.volume) {
				resource.volume.setVolume(queue.volume);
			}

			queue.player.play(resource);
			queue.isPlaying = true;

			// Handle player events
			queue.player.once(AudioPlayerStatus.Idle, () => {
				queue.songs.shift();
				if (queue.songs.length > 0) {
					this.play(guildId, voiceChannel, textChannel);
				} else {
					queue.isPlaying = false;
					if (textChannel) {
						textChannel.send('🎵 Queue finished! Add more songs or use /stop to disconnect.');
					}
				}
			});

			queue.player.on('error', error => {
				console.error('Audio player error:', error);
				queue.songs.shift();
				if (queue.songs.length > 0) {
					this.play(guildId, voiceChannel, textChannel);
				}
			});

		} catch (error) {
			console.error('Error playing song:', error);
			queue.songs.shift();
			if (queue.songs.length > 0) {
				this.play(guildId, voiceChannel, textChannel);
			}
		}
	}

	pause(guildId) {
		const queue = this.getQueue(guildId);
		if (queue && queue.player) {
			queue.player.pause();
			return true;
		}
		return false;
	}

	resume(guildId) {
		const queue = this.getQueue(guildId);
		if (queue && queue.player) {
			queue.player.unpause();
			return true;
		}
		return false;
	}

	skip(guildId) {
		const queue = this.getQueue(guildId);
		if (queue && queue.player) {
			queue.player.stop();
			return true;
		}
		return false;
	}

	stop(guildId) {
		const queue = this.getQueue(guildId);
		if (queue) {
			queue.songs = [];
			if (queue.player) {
				queue.player.stop();
			}
			if (queue.connection) {
				queue.connection.destroy();
			}
			this.queues.delete(guildId);
			return true;
		}
		return false;
	}

	async searchYouTube(query) {
		try {
			const result = await ytsearch(query);
			if (result.videos.length > 0) {
				const video = result.videos[0];
				return {
					title: video.title,
					url: video.url,
					duration: video.timestamp,
					thumbnail: video.thumbnail,
					author: video.author.name
				};
			}
			return null;
		} catch (error) {
			console.error('YouTube search error:', error);
			return null;
		}
	}

	async getVideoInfo(url) {
		try {
			const info = await ytdl.getInfo(url);
			return {
				title: info.videoDetails.title,
				url: info.videoDetails.video_url,
				duration: this.formatDuration(parseInt(info.videoDetails.lengthSeconds)),
				thumbnail: info.videoDetails.thumbnails[0]?.url,
				author: info.videoDetails.author.name
			};
		} catch (error) {
			console.error('Error getting video info:', error);
			return null;
		}
	}

	formatDuration(seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		
		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	}
}

module.exports = new MusicManager();

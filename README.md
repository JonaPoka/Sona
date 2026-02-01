# Sona Discord Bot

A modular Discord bot with a fully-fledged music player system supporting YouTube.

## Features

### Music Player System
- 🎵 Play songs from YouTube (URL or search)
- ⏸️ Pause/Resume playback
- ⏭️ Skip to next song
- ⏹️ Stop playback and clear queue
- 📋 View current queue
- 🎶 Display now playing information
- 🔊 High-quality audio streaming

### Command System
- Modular slash command architecture
- Easy to extend with new commands

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure the bot:**
   - Copy `config.json.example` to `config.json`
   - Add your Discord bot token
   - (Optional) Add guild ID for faster command registration during development

3. **Run the bot:**
   ```bash
   npm start
   ```

## Music Commands

All music commands use Discord's slash command system. Type `/` in Discord to see available commands.

- `/play <query>` - Play a song from YouTube (URL or search query)
- `/pause` - Pause the current song
- `/resume` - Resume the paused song
- `/skip` - Skip to the next song in queue
- `/stop` - Stop playing and clear the queue
- `/queue` - Display the current music queue
- `/nowplaying` - Show currently playing song information

## Requirements

- Node.js 16.x or higher
- Discord bot with the following permissions:
  - Connect (to join voice channels)
  - Speak (to play audio)
  - Send Messages (to respond to commands)
- Bot must be in a server with voice channels

## Bot Setup Guide

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Enable the following Privileged Gateway Intents:
   - Message Content Intent
5. Copy the bot token to your `config.json`
6. Go to OAuth2 → URL Generator
7. Select scopes: `bot` and `applications.commands`
8. Select permissions: `Connect`, `Speak`, `Send Messages`, `Use Slash Commands`
9. Use the generated URL to invite the bot to your server

## Architecture

The bot uses a modular architecture:
- `index.js` - Main bot file, handles initialization and command loading
- `musicManager.js` - Music player logic and queue management
- `commands/` - Folder containing command modules organized by category
  - `debug/` - Debug/utility commands
  - `music/` - Music player commands

## Adding New Commands

1. Create a new folder in `commands/` for your category (if needed)
2. Create a new `.js` file with the following structure:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commandname')
    .setDescription('Command description'),
  async execute(interaction, client) {
    // Your command logic here
    await interaction.reply('Response');
  },
};
```

3. The bot will automatically load and register the command on startup

## Troubleshooting

### Bot doesn't join voice channel
- Ensure the bot has "Connect" and "Speak" permissions
- Make sure you're in a voice channel when using music commands

### Music doesn't play
- Check that FFmpeg is installed on your system
- Ensure the bot has proper permissions in the voice channel
- Verify your internet connection for YouTube streaming

### Commands don't appear
- Wait a few minutes for global commands to sync (use guildId for instant dev updates)
- Ensure the bot has "Use Application Commands" permission

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

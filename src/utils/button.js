const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createButtonRow(player) {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('playpause')
			.setEmoji(player.paused ? '▶️' : '⏸️')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId('next')
			.setEmoji('⏭️')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(player.queue.size < 1),
		new ButtonBuilder()
			.setCustomId('loop')
			.setEmoji(player.queueRepeat ? '🔁' : player.trackRepeat ? '🔂' : '➡️')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId('stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger)
	);
}

module.exports = { createButtonRow };

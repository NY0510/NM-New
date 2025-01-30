const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	createMusicControlButton(player) {
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
	},

	createAddToQueueButton(type, uri) {
		return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`add_${type}_${uri}`).setLabel('➕ 대기열에 추가').setStyle(ButtonStyle.Primary));
	},
};

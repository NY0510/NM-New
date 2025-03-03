const { EmbedBuilder, MessageFlags } = require('discord.js');
const { createMusicControlButton } = require('./button');
const { hyperlink, textLengthOverCut, msToTime } = require('./format');
const { createAddToQueueButton } = require('./button');

const sendError = (interaction, message, followUp = false) => {
	const payload = {
		embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription(message)],
		flags: [MessageFlags.Ephemeral],
	};

	if (followUp) return interaction.followUp(payload);
	return interaction.reply(payload);
};

const checkPlayerAndVoiceChannel = (interaction, player) => {
	if (!player || !player?.queue?.current) {
		return {
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription('재생중인 음악이 없어요')],
			flags: [MessageFlags.Ephemeral],
		};
	}

	if (!interaction.member.voice.channel) {
		return {
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription('먼저 음성 채널에 접속한 다음에 사용해주세요')],
			flags: [MessageFlags.Ephemeral],
		};
	}

	if (interaction.member.voice.channel?.id !== player.voiceChannel) {
		return {
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription(`저와 같은 음성채널에 접속해 있지 않은 것 같아요`)],
			flags: [MessageFlags.Ephemeral],
		};
	}

	return null;
};

const filterTracks = (tracks) => {
	const filters = ['TJ노래방 공식 유튜브채널'];
	return tracks.filter((track) => !filters.includes(track.author));
};

const isPlaylistURL = (url) => {
	const playlistPattern = /[?&]list=([^&]+)/;
	const videoPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^?&]+)/;
	return playlistPattern.test(url) && !videoPattern.test(url);
};

const addTrackToQueue = async (track, player, interaction) => {
	track.requester = interaction.member.user;
	player.queue.add(track);

	if (player.lastMessage) {
		const row = createMusicControlButton(player);
		player.lastMessage.edit({ components: [row] });
	}

	const row = createAddToQueueButton('track', track.uri);
	await interaction.followUp({
		embeds: [
			new EmbedBuilder()
				.setTitle(`💿 음악을 대기열에 추가했어요 (${msToTime(track.duration)})`)
				.setDescription(hyperlink(textLengthOverCut(track.title, 50), track.uri))
				.setThumbnail(track.artworkUrl)
				.setColor(interaction.client.config.color.normal),
		],
		components: [row],
	});

	if (!player.playing && !player.paused && !player.queue.size) player.play();
};

const addPlaylistToQueue = async (playlist, player, interaction, query) => {
	const filteredTracks = filterTracks(playlist.tracks);
	if (filteredTracks.length === 0) {
		if (!player.queue.current) await player.destroy();
		log.error(`검색 결과 없음: ${playlist.uri}`);
		return sendError(interaction, '샅샅이 살펴보았지만, 그런 음악은 없는 것 같아요', true);
	}

	filteredTracks.forEach((track) => {
		track.requester = interaction.member.user;
		player.queue.add(track);
	});

	if (player.lastMessage) {
		const row = createMusicControlButton(player);
		player.lastMessage.edit({ components: [row] });
	}

	const row = createAddToQueueButton('playlist', query);
	await interaction.followUp({
		embeds: [
			new EmbedBuilder()
				.setTitle(`📜 재생목록에 포함된 노래 ${filteredTracks.length}곡을 대기열에 추가했어요 (${msToTime(playlist.duration)})`)
				.setDescription(hyperlink(textLengthOverCut(playlist.name, 50), query))
				.setThumbnail(playlist.tracks[0].artworkUrl)
				.setColor(interaction.client.config.color.normal),
		],
		components: [row],
	});

	if (!player.playing && !player.paused) player.play();
};

module.exports = { checkPlayerAndVoiceChannel, filterTracks, isPlaylistURL, addTrackToQueue, addPlaylistToQueue, sendError };

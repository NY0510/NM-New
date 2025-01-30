const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, channelMention, MessageFlags } = require('discord.js');
const { getAutocompleteSearch } = require('../../utils/autocomplete');
const { msToTime, textLengthOverCut, hyperlink } = require('../../utils/format');
const { createMusicControlButton } = require('../../utils/button');
const { addPlaylistToQueue, filterTracks, isPlaylistURL, addTrackToQueue, sendError } = require('../../utils/music');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('음악을 재생해요')
		.addStringOption((option) => option.setName('query').setDescription('검색어를 입력해주세요').setRequired(true).setAutocomplete(true)),

	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		let choices = [];
		try {
			const urlPattern = /^(https?:\/\/)/;
			if (!focusedValue) {
				choices = ['검색어 또는 URL을 입력해주세요'];
			} else if (urlPattern.test(focusedValue)) {
				choices = [];
			} else {
				choices = await getAutocompleteSearch(focusedValue);
			}
			await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
		} catch (e) {
			log.error(`검색 자동완성을 불러오는 중 오류가 발생했습니다\nError: ${e.message}`);
		}
	},

	async execute(interaction) {
		const query = interaction.options.getString('query', true);

		if (query == '검색어 또는 URL을 입력해주세요') {
			return sendError(interaction, '검색어 또는 URL을 입력해주세요');
		}

		if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak])) {
			return sendError(interaction, `${channelMention(interaction.member.voice.channel.id)} 채널에 연결하거나 말할 수 있는 권한이 필요해요`);
		}

		if (!interaction.member.voice.channel) {
			return sendError(interaction, '먼저 음성 채널에 접속한 다음에 사용해주세요');
		}

		let player = interaction.client.manager.players.get(interaction.guild.id);
		if (!player) {
			player = interaction.client.manager.create({
				guild: interaction.guild.id,
				voiceChannel: interaction.member.voice.channel.id,
				textChannel: interaction.channel.id,
				volume: 50,
				selfDeafen: true,
				repeat: 'none',
			});
		}

		if (interaction.member.voice.channel?.id !== player.voiceChannel) {
			return sendError(interaction, `저와 같은 음성채널에 접속해 있지 않은 것 같아요`);
		}

		await interaction.deferReply();

		let res;
		try {
			res = await interaction.client.manager.search(query);
			if (res.loadType === 'error') throw res.exception;
			if (res.loadType === 'playlist' && !isPlaylistURL(query)) {
				res = await interaction.client.manager.search(query.split('&list=')[0]);
				res.loadType = 'track';
			}

			if (!['CONNECTED', 'CONNECTING'].includes(player.state)) {
				await player.connect();
			}
		} catch (e) {
			log.error(`음악을 검색하는 중 알 수 없는 오류가 발생했습니다\nError: ${e}`);
			return sendError(interaction, '이런! 음악을 검색하는 도중 알 수 없는 오류가 발생했어요\n혹시 비공개 영상이거나, 잘못된 링크가 아닌가요?', true);
		}

		switch (res.loadType) {
			case 'empty': {
				if (!player.queue.current) await player.destroy();
				log.error(`검색 결과 없음: ${query}`);
				return sendError(interaction, '샅샅이 살펴보았지만, 그런 음악은 없는 것 같아요', true);
			}

			case 'track':
			case 'search': {
				let track = filterTracks(res.tracks)[0];

				if (!track) {
					if (!player.queue.current) await player.destroy();
					log.error(`검색 결과 없음: ${query}`);
					return sendError(interaction, '샅샅이 살펴보았지만, 그런 음악은 없는 것 같아요', true);
				}

				if (track.duration < 5000) {
					// Check if the track is shorter than 5 seconds
					if (!player.queue.current) await player.destroy();
					return sendError(interaction, '5초보다 짧은 영상은 재생할 수 없어요', true);
				}

				await addTrackToQueue(track, player, interaction);
				break;
			}

			case 'playlist': {
				await addPlaylistToQueue(res.playlist, player, interaction, query);
				break;
			}

			default: {
				log.info('default', res.loadType);
				break;
			}
		}
	},
};

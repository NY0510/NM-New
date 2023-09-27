const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, channelMention, hyperlink } = require("discord.js");
const { getAutocompleteSearch } = require("../../utils/autocomplete");
const { msToTime, textLengthOverCut } = require("../../utils/format");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("음악을 재생해요")
		.addStringOption((option) => option.setName("query").setDescription("검색어를 입력해주세요").setRequired(true).setAutocomplete(true)),

	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused().toLowerCase().trim();
		let choices = [];
		try {
			if (!focusedValue) choices = ["검색어 또는 URL을 입력해주세요"];
			else choices = await getAutocompleteSearch(focusedValue);
		} catch (e) {
			log.error(`검색 자동완성을 불러오는 중 오류가 발생했습니다\nError: ${e.message}`);
		}
		const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
		await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
	},

	async execute(interaction) {
		const query = interaction.options.getString("query", true);

		if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak])) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(interaction.client.config.color.error)
						.setDescription(`${channelMention(interaction.member.voice.channel.id)} 채널에 연결하거나 말할 수 있는 권한이 필요해요`),
				],
			});
		}

		if (!interaction.member.voice.channel) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription("먼저 음성 채널에 접속한 다음에 사용해주세요")],
				ephemeral: true,
			});
		}

		const player = interaction.client.manager.create({
			guild: interaction.guild.id,
			voiceChannel: interaction.member.voice.channel.id,
			textChannel: interaction.channel.id,
			volume: 50,
			selfDeafen: true,
			repeat: "none",
		});

		if (interaction.member.voice.channel?.id !== player.voiceChannel) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription(`저와 같은 음성채널에 접속해 있지 않은 것 같아요`)],
				ephemeral: true,
			});
		}

		// 음성채널 접속
		if (!["CONNECTED", "CONNECTING"].includes(player.state)) {
			await player.connect();
			await interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription(`🔊 ${channelMention(interaction.member.voice.channel.id)} 채널에 접속했어요`)],
			});
		}

		let res;
		try {
			res = await interaction.client.manager.search(query);
			if (res.loadType === "error") throw res.exception;
		} catch (e) {
			log.error(`음악을 검색하는 중 알 수 없는 오류가 발생했습니다\nError: ${e}`);
			return interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setColor(interaction.client.config.color.error)
						.setTitle("🐛 으에... 오류다")
						.setDescription(`이런! 음악을 검색하는 도중 알 수 없는 오류가 발생했어요\n혹시 비공개 영상이거나, 잘못된 링크가 아닌가요?`),
				],
				ephemeral: true,
			});
		}

		switch (res.loadType) {
			case "empty": {
				if (!player.queue.current) await player.destroy();
				return interaction.followUp({
					embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setTitle("🤔 흠...").setDescription("샅샅이 살펴보았지만, 그런 음악은 없는 것 같아요")],
					ephemeral: true,
				});
			}

			case "track":
			case "search": {
				let track = res.tracks[0];
				track.requester = interaction.member.user;
				player.queue.add(track);
				if (!player.playing && !player.paused && !player.queue.size) player.play();

				const repeatState = player.repeat == "none" ? (player.repeat == "track" ? "곡 반복" : "대기열 반복") : "반복없음";
				await interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setTitle(`💿 음악을 대기열에 추가했어요`)
							.setDescription(hyperlink(textLengthOverCut(track.title, 50), track.uri))
							.setThumbnail(track.artworkUrl)
							.setColor(interaction.client.config.color.normal)
							.addFields(
								{
									name: "곡 길이",
									value: `┕** \`${track.isStream ? "LIVE" : msToTime(track.duration)}\`**`,
									inline: true,
								},
								{
									name: "남은 대기열",
									value: `┕** \`${player.queue.length}곡\`**`,
									inline: true,
								},
								{
									name: "볼륨",
									value: `┕** \`${player.volume}%\`**`,
									inline: true,
								},
								{
									name: "반복",
									value: `┕** \`${repeatState}\`**`,
									inline: true,
								},
								{
									name: "요청자",
									value: `┕** ${track.requester}**`,
									inline: true,
								},
								{
									name: "채널명",
									value: `┕** \`${track.author}\`**`,
									inline: true,
								}
							),
					],
					ephemeral: false,
				});
				break;
			}

			case "playlist": {
				res.playlist.tracks.forEach((track) => {
					track.requester = interaction.member.user;
					player.queue.add(track);
				});
				if (!player.playing && !player.paused && player.queue.totalSize === res.playlist.tracks.length) player.play();

				const repeatState = player.repeat == "none" ? (player.repeat == "track" ? "곡 반복" : "대기열 반복") : "반복없음";
				await interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setTitle(`📜 재생목록을 대기열에 추가했어요`)
							.setDescription(hyperlink(textLengthOverCut(res.playlist.name, 50), query))
							.setThumbnail(res.playlist.tracks[0].artworkUrl)
							.setColor(interaction.client.config.color.normal)
							.addFields(
								{
									name: "재생목록 길이",
									value: `┕** \`${msToTime(res.playlist.duration)}\`**`,
									inline: true,
								},
								{
									name: "남은 대기열",
									value: `┕** \`${player.queue.length}곡\`**`,
									inline: true,
								},
								{
									name: "볼륨",
									value: `┕** \`${player.volume}%\`**`,
									inline: true,
								},
								{
									name: "반복",
									value: `┕** \`${repeatState}\`**`,
									inline: true,
								},
								{
									name: "요청자",
									value: `┕** ${res.playlist.tracks[0].requester}**`,
									inline: true,
								},
								{
									name: "\u200b",
									value: "\u200b",
									inline: true,
								}
							),
					],
				});
				break;
			}

			default: {
				log.info("default", res.loadType);
				break;
			}
		}
	},
};

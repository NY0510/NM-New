const { SlashCommandBuilder, EmbedBuilder, channelMention, MessageFlags } = require('discord.js');
const { getChart } = require('../../utils/melon');
const { textLengthOverCut, msToTime } = require('../../utils/format');
const { checkPlayerAndVoiceChannel } = require('../../utils/music');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('melon')
		.setDescription('멜론 차트를 불러와요')
		.addIntegerOption((option) => option.setName('rank').setDescription('몇 위의 음악까지 불러올지 설정해요 (기본 25위)').setMinValue(1).setMaxValue(50)),
	async execute(interaction) {
		let player = interaction.client.manager.get(interaction.guild.id);
		const rank = interaction.options.getInteger('rank') || 25;

		if (!interaction.member.voice.channel) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription('먼저 음성 채널에 접속한 다음에 사용해주세요')],
				flags: [MessageFlags.Ephemeral],
			});
		}

		if (!player || !player?.queue?.current) {
			player = interaction.client.manager.create({
				guild: interaction.guild.id,
				voiceChannel: interaction.member.voice.channel.id,
				textChannel: interaction.channel.id,
				volume: 50,
				selfDeafen: true,
				repeat: 'none',
			});
		}

		await interaction.deferReply();

		if (!['CONNECTED', 'CONNECTING'].includes(player.state)) {
			await player.connect();
			// await interaction.editReply({
			// 	embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription(`${channelMention(interaction.member.voice.channel.id)} 채널에 접속했어요`)],
			// });
		}

		if (interaction.member.voice.channel?.id !== player.voiceChannel) {
			return interaction.editReply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription(`저와 같은 음성채널에 접속해 있지 않은 것 같아요`)],
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction
			.followUp({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setTitle(`멜론차트 ${rank}곡을 불러오는 중이에요`)],
			})
			.then(async (msg) => {
				try {
					const data = await getChart(rank);
					const tracks = data.songs;

					let res;
					for (let i = 0; i < tracks.length; i++) {
						try {
							res = await interaction.client.manager.search(`${tracks[i].title} ${tracks[i].artist} topic`);
							if (res.loadType === 'error') throw res.exception;
						} catch (e) {
							log.error(`음악을 검색하는 중 알 수 없는 오류가 발생했습니다\nError: ${e}`);
							return await msg.edit({
								embeds: [
									new EmbedBuilder()
										.setColor(interaction.client.config.color.error)
										.setTitle('🐛 으에... 오류다')
										.setDescription(`이런! 음악을 검색하는 도중 알 수 없는 오류가 발생했어요\n혹시 비공개 영상이거나, 잘못된 링크가 아닌가요?`),
								],
								flags: [MessageFlags.Ephemeral],
							});
						}

						let trackResult = res.tracks[0];
						trackResult.requester = interaction.member.user;
						player.queue.add(trackResult);

						await msg.edit({
							embeds: [
								new EmbedBuilder()
									.setColor(interaction.client.config.color.normal)
									.setTitle(`멜론차트 ${rank}곡을 불러오는 중이에요 (${i + 1}/${rank})`)
									.setDescription(`${textLengthOverCut(trackResult.title, 50)} \`${msToTime(trackResult.duration)}\``),
							],
						});

						if (!player.playing && !player.paused && i == 0) player.play(); // 첫번째 음악이 추가되면 재생
					}

					await msg.edit({
						embeds: [
							new EmbedBuilder()
								.setColor(interaction.client.config.color.normal)
								.setTitle(`멜론차트 ${rank}곡을 모두 불러왔어요!`)
								.setFooter({ text: `${data.date} ${data.time} 기준 차트에요` }),
						],
					});
				} catch (e) {
					log.error(`멜론차트를 불러오는 도중 알 수 없는 오류가 발생했습니다\nError: ${e}`);
					return interaction.editReply({
						embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription(`멜론차트를 불러오는 도중 알 수 없는 오류가 발생했어요`)],
						flags: [MessageFlags.Ephemeral],
					});
				}
			});
	},
};

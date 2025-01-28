const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { msToTime, textLengthOverCut, hyperlink, progressBar } = require('../../utils/format');
const { checkPlayerAndVoiceChannel } = require('../../utils/music');

module.exports = {
	data: new SlashCommandBuilder().setName('now').setDescription('현재 재생중인 음악을 보여줘요'),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);

		const errorResponse = checkPlayerAndVoiceChannel(interaction, player);
		if (errorResponse) return interaction.reply(errorResponse);

		const track = player.queue.current;
		await interaction.deferReply();

		const repeatState = player.queueRepeat ? '대기열 반복 중' : player.trackRepeat ? '곡 반복 중' : '반복 중이 아님';
		interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle('🎶 현재 재생중')
					.setThumbnail(track.artworkUrl)
					.setDescription(`${player.playing ? '▶️' : '⏸️'} **${hyperlink(textLengthOverCut(track.title, 50), track.uri)}**\n\n${progressBar(player)}\n${msToTime(player.position)} / ${msToTime(player.queue.current.duration)}`)
					.setColor(interaction.client.config.color.normal)
					.addFields(
						{
							name: '곡 길이',
							value: `┕** \`${track.isStream ? 'LIVE' : msToTime(track.duration)}\`**`,
							inline: true,
						},
						{
							name: '남은 대기열',
							value: `┕** \`${player.queue.length}곡\`**`,
							inline: true,
						},
						{
							name: '볼륨',
							value: `┕** \`${player.volume}%\`**`,
							inline: true,
						},
						{
							name: '반복',
							value: `┕** \`${repeatState}\`**`,
							inline: true,
						},
						{
							name: '요청자',
							value: `┕** ${track.requester}**`,
							inline: true,
						},
						{
							name: '채널명',
							value: `┕** \`${track.author}\`**`,
							inline: true,
						}
					),
			],
		});
	},
};

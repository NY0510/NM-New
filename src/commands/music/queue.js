const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { msToTime, textLengthOverCut, hyperlink } = require('../../utils/format');
const { checkPlayerAndVoiceChannel } = require('../../utils/music');

module.exports = {
	data: new SlashCommandBuilder().setName('queue').setDescription('대기열을 확인해요'),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);

		const errorResponse = checkPlayerAndVoiceChannel(interaction, player);
		if (errorResponse) return interaction.reply(errorResponse);

		await interaction.deferReply();

		const queueList = Array.from(player.queue, (song, index) => ({
			title: `${index + 1}. ${song.title}`,
			duration: song.isStream ? 'LIVE' : msToTime(song.duration),
			requester: song.requester,
		}));

		const itemsPerPage = 10;
		let currentPage = 0;
		const maxPage = Math.ceil(queueList.length / itemsPerPage);

		const getQueueListForPage = (page) => {
			const startIdx = page * itemsPerPage;
			const endIdx = startIdx + itemsPerPage;
			return queueList.slice(startIdx, endIdx);
		};

		const getQueueEmbed = (queueListForPage) => {
			const leftQueue = Math.max(queueList.length - (currentPage + 1) * itemsPerPage, 0);

			const footerText = player.queue.size > itemsPerPage ? `( ${currentPage + 1} / ${maxPage} 페이지 )${leftQueue > 0 ? `\n+${leftQueue}곡` : ''}` : ' ';
			return new EmbedBuilder()
				.setColor(interaction.client.config.color.normal)
				.setTitle('📋 현재 대기열')
				.setDescription(`🎶 ${hyperlink(textLengthOverCut(player.queue.current.title, 50), player.queue.current.uri)}`)
				.setFooter({ text: footerText })
				.addFields(
					...queueListForPage.map((song) => ({
						name: textLengthOverCut(song.title, 50),
						value: `**\`${song.duration}\`** (${song.requester})`,
					}))
				);
		};

		const paginationRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('queue_previous').setLabel('이전').setStyle(ButtonStyle.Secondary).setEmoji('⏮️'), new ButtonBuilder().setCustomId('queue_next').setLabel('다음').setStyle(ButtonStyle.Secondary).setEmoji('⏭️'));

		const paginationBtnDisable = (row) => {
			row.components[0].setDisabled(currentPage === 0);
			row.components[1].setDisabled(currentPage === maxPage - 1);
		};

		paginationBtnDisable(paginationRow);
		const replyMessage = await interaction.editReply({
			embeds: [getQueueEmbed(getQueueListForPage(currentPage))],
			components: player.queue.size > itemsPerPage ? [paginationRow] : [],
		});

		const collector = replyMessage.createMessageComponentCollector({
			filter: (i) => i.customId === 'queue_previous' || i.customId === 'queue_next',
			// time: 120 * 1000,
		});

		collector.on('collect', async (i) => {
			if (i.customId === 'queue_previous') {
				console.log('queue previous');
				currentPage = Math.max(currentPage - 1, 0);
			} else if (i.customId === 'queue_next') {
				console.log('queue next');
				currentPage = Math.min(currentPage + 1, maxPage - 1);
			}

			paginationBtnDisable(paginationRow);

			await i.update({
				embeds: [getQueueEmbed(getQueueListForPage(currentPage))],
				components: [paginationRow],
			});
		});

		collector.on('end', async () => {
			try {
				if (player.queue.size > itemsPerPage) {
					paginationRow.components.forEach((c) => c.setDisabled(true));
					await replyMessage.edit({ embeds: [getQueueEmbed(getQueueListForPage(currentPage))], components: [paginationRow] });
				}
			} catch (error) {
				if (error.code === 10062) {
					console.log('Interaction expired before end handler could run.');
				} else {
					console.error('Error ending interaction:', error);
				}
			}
		});
	},
};

const { Manager } = require('magmastream');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { generateCardImage } = require('./imageGenerator');
const wait = require('timers/promises').setTimeout;
const { hyperlink, textLengthOverCut } = require('./format');
const { createMusicControlButton } = require('./button');

module.exports = async (client) => {
	const nodes = [
		{
			host: client.config.lavalink.host,
			identifier: 'Node 1',
			password: client.config.lavalink.passwd,
			port: client.config.lavalink.port,
			retryAmount: 1000,
			retrydelay: 10000,
			resumeStatus: false,
			resumeTimeout: 1000,
			secure: false, // default: false
		},
	];

	client.manager = new Manager({
		nodes,
		defaultSearchPlatform: 'ytsearch',
		autoPlay: true,
		send: (id, payload) => {
			const guild = client.guilds.cache.get(id);
			if (guild) guild.shard.send(payload);
		},
	})
		.on('nodeConnect', (node) => {
			log.info(`Lavalink 노드 "${node.options.identifier}" 연결 완료`);
		})
		.on('nodeDisconnect', (node, reason) => {
			log.warn(`Lavalink 노드 "${node.options.identifier}" 연결이 끊어졌습니다\nReason: ${JSON.stringify(reason)}`);
		})
		.on('nodeReconnect', (node) => {
			log.info(`Lavalink 노드 "${node.options.identifier}" 재연결 완료`);
		})
		.on('nodeError', (node, error) => {
			log.error(`Lavalink 노드  "${node.options.identifier}" 에 연결하는 중 오류가 발생했습니다\nError: ${error.message}`);
		})
		.on('trackStart', async (player, track) => {
			const bindChannel = client.channels.cache.get(player.textChannel);

			// if (!player.trackRepeat) {
			if (player.lastMessage) {
				try {
					await player.lastMessage.delete();
					player.lastMessage = null;
				} catch (error) {
					log.warn(`이전 음악 재생 메세지를 삭제하는 중 오류가 발생했습니다: ${error.message}`);
					return;
				}
			}

			const cardImage = await generateCardImage(track);
			const cardAttachment = new AttachmentBuilder(cardImage, 'card.webp');
			const row = createMusicControlButton(player);

			const newMessage = await bindChannel.send({ content: `🎵 ${hyperlink(textLengthOverCut(track.title, 50), track.uri)}`, files: [cardAttachment], components: [row] });
			player.lastMessage = newMessage;
			// }
			log.music(`'${track.title}' 음악이 '${bindChannel.guild.name} (${bindChannel.guild.id})' 서버 에서 '${track.requester.username}#${track.requester.discriminator} (${track.requester.id})'에 의해 재생되었습니다`);
		})
		.on('queueEnd', (player) => {
			client.channels.cache.get(player.textChannel).send({ embeds: [new EmbedBuilder().setDescription('대기열에 있는 음악을 모두 재생했어요').setColor(client.config.color.normal)] });

			wait(2000);
			player.destroy();
		})
		.on('trackError', (player, track, error) => {
			log.error(`'${track.title}' 음악을 재생하는 중 오류가 발생했습니다\nError: ${error.message}`);
			client.channels.cache.get(player.textChannel).send({ embeds: [new EmbedBuilder().setDescription('음악을 재생하는 중 오류가 발생했습니다').setColor(client.config.color.error)] });
		})
		.on('trackStuck', async (player, track, threshold) => {
			log.warn(`'${track.title}' 음악이 '${threshold}ms' 동안 재생되지 않아 스킵합니다`);
			await client.channels.cache.get(player.textChannel).send({ embeds: [new EmbedBuilder().setDescription('음악이 재생되지 않아 스킵했어요').setColor(client.config.color.error)] });
			await player.queue.next();
		});
};

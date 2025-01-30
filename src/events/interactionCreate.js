const { Events, EmbedBuilder, MessageFlags } = require('discord.js');
const { createMusicControlButton } = require('../utils/button');
const { filterTracks, addTrackToQueue, addPlaylistToQueue, sendError } = require('../utils/music');

module.exports = {
	name: Events.InteractionCreate,

	async execute(client, interaction) {
		if (interaction.isButton()) {
			const player = client.manager.players.get(interaction.guild.id);
			if (!player && !interaction.customId.startsWith('add'))
				return interaction.reply({
					embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription('재생중인 음악이 없어요')],
					flags: [MessageFlags.Ephemeral],
				});

			if (interaction.replied || interaction.deferred) return;

			try {
				await interaction.deferUpdate();
			} catch (error) {
				if (error.code !== 'InteractionAlreadyReplied') {
					throw error;
				}
			}

			switch (interaction.customId) {
				case 'playpause':
					player.pause(!player.paused);
					break;
				case 'next':
					player.stop();
					break;
				case 'loop':
					if (!player.queueRepeat && !player.trackRepeat) {
						player.setTrackRepeat(true);
					} else if (player.trackRepeat) {
						player.setTrackRepeat(false);
						player.setQueueRepeat(true);
					} else {
						player.setQueueRepeat(false);
					}
					break;
				case 'stop':
					player.destroy();
					break;
				default:
					if (interaction.customId.startsWith('add')) {
						const [action, type, uri] = interaction.customId.split('_');
						if (action !== 'add') return;

						let res;
						let player = client.manager.players.get(interaction.guild.id);
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

						try {
							res = await client.manager.search(uri);
							if (res.loadType === 'error') throw res.exception;

							if (type === 'track') {
								const track = filterTracks(res.tracks)[0];
								if (track) await addTrackToQueue(track, player, interaction);
							} else if (type === 'playlist') {
								await addPlaylistToQueue(res.playlist, player, interaction, uri);
							}

							if (!['CONNECTED', 'CONNECTING'].includes(player.state)) {
								await player.connect();
							}
						} catch (e) {
							log.error(`음악을 검색하는 중 알 수 없는 오류가 발생했습니다\nError: ${e}`);
							return sendError(interaction, '이런! 음악을 검색하는 도중 알 수 없는 오류가 발생했어요\n혹시 비공개 영상이거나, 잘못된 링크가 아닌가요?', true);
						}
					}
					break;
			}

			if (player?.lastMessage === interaction.message) {
				const row = createMusicControlButton(player);
				await interaction.message.edit({ components: [row] });
			}

			if (interaction.client.config.logging.button) log.info(`"${interaction.guild.name}" 서버에서 "${interaction.user.tag}" 유저가 "${interaction.customId}" 버튼을 "#${interaction.channel.name}" 채널에서 클릭했습니다`);

			return;
		} else if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				return log.error(`${interaction.commandName} 명령어를 찾을 수 없습니다`);
			}

			if (interaction.client.config.logging.command) log.info(`"${interaction.guild.name}" 서버에서 "${interaction.user.tag}" 유저가 "${interaction.commandName}" 명령어를 "#${interaction.channel.name}" 채널에서 실행했습니다`);
			await command.execute(interaction);
		} else if (interaction.isAutocomplete()) {
			try {
				const command = interaction.client.commands.get(interaction.commandName);
				await command.autocomplete(interaction);
			} catch (e) {
				log.error(`${interaction.commandName} 명령어 자동완성 중 오류가 발생했습니다\nError: ${e}`);
			}
		}
	},
};

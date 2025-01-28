const { Events, EmbedBuilder, MessageFlags } = require('discord.js');
const { createButtonRow } = require('../utils/button');

module.exports = {
	name: Events.InteractionCreate,

	async execute(client, interaction) {
		if (interaction.isButton()) {
			const player = client.manager.players.get(interaction.guild.id);
			if (!player)
				return interaction.reply({
					embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription('현재 재생중인 음악이 없어요')],
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
			}

			const row = createButtonRow(player);
			await interaction.message.edit({ components: [row] });

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

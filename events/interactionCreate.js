const { Events } = require("discord.js");

module.exports = {
	name: Events.InteractionCreate,

	async execute(interaction) {
		if (interaction.isButton()) {
			return log.info(`"${interaction.guild.name}" 서버에서 "${interaction.user.tag}" 유저가 "${interaction.customId}" 버튼을 "#${interaction.channel.name}" 채널에서 클릭했습니다`);
		}

		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			return log.error(`${interaction.commandName} 명령어를 찾을 수 없습니다`);
		}

		try {
			if (interaction.isAutocomplete()) {
				await command.autocomplete(interaction);
			} else if (interaction.isChatInputCommand()) {
				await command.execute(interaction);
				log.info(`"${interaction.guild.name}" 서버에서 "${interaction.user.tag}" 유저가 "${interaction.commandName}" 명령어를 "#${interaction.channel.name}" 채널에서 실행했습니다`);
			}
		} catch (e) {
			await interaction.editReply({ content: `\`${interaction.commandName}\` 명령어를 실행하는 중 오류가 발생했어요`, ephemeral: true });
			log.error(`${interaction.commandName} 명령어를 실행하는 중 오류가 발생했습니다\nError: ${e}`);
		}
	},
};

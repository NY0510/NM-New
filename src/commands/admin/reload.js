const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("reload")
		.setDescription("명령어 리로드 (개발자 전용)")
		.addStringOption((option) => option.setName("category").setDescription("명령어 카테고리").setRequired(true).setAutocomplete(true))
		.addStringOption((option) => option.setName("command").setDescription("명령어 이름").setRequired(true).setAutocomplete(true)),

	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		let choices;

		if (interaction.user.id !== interaction.client.config.ownerId) choices = [];
		else if (focusedOption.name === "category") {
			const foldersPath = path.join(__dirname, "..");
			const commandFolders = fs.readdirSync(foldersPath).filter((file) => file !== ".DS_Store"); // MacOS .DS_Store 파일 제외
			choices = commandFolders;
		} else if (focusedOption.name === "command") {
			const commandsPath = path.join(__dirname, "..", interaction.options.getString("category", true));
			const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
			choices = commandFiles.map((file) => file.replace(".js", ""));
		}

		const filtered = choices.filter((choice) => choice.startsWith(focusedOption.value));
		await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
	},

	async execute(interaction) {
		if (interaction.user.id !== interaction.client.config.ownerId) return interaction.reply({ content: "이 명령어를 실행할 권한이 없어요", ephemeral: true });

		const commandName = interaction.options.getString("command", true).toLowerCase();
		const category = interaction.options.getString("category", true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply({ content: `\`${commandName}\` 명령어를 찾을 수 없어요`, ephemeral: true });
		}

		delete require.cache[require.resolve(`../${category}/${command.data.name}.js`)];

		try {
			interaction.client.commands.delete(command.data.name);
			const newCommand = require(`../${category}/${command.data.name}.js`);
			interaction.client.commands.set(newCommand.data.name, newCommand);
			await interaction.reply({ content: `\`${newCommand.data.name}\` 명령어를 리로드했어요`, ephemeral: true });
		} catch (e) {
			log.error(e);
			await interaction.reply({ content: `${command.data.name} 명령어를 리로드하는 중 오류가 발생했어요\nError: \`${e.message}\``, ephemeral: true });
		}
	},
};

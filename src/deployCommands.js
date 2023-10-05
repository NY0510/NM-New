const { REST, Routes } = require("discord.js");
const { clientId, devGuildId, token } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");
const log = require("./utils/logging");

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath).filter((file) => file !== ".DS_Store"); // MacOS .DS_Store 파일 제외

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ("data" in command && "execute" in command) {
			commands.push(command.data.toJSON());
		} else {
			log.warn(`${filePath} 명령어에 필요한 "data" 또는 "execute" 속성이 누락되었습니다`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		log.info(`${commands.length} 개의 슬래시 명령어를 리로드 하는 중...`);

		const data = await rest.put(Routes.applicationGuildCommands(clientId, devGuildId), { body: commands });
		// const data = await rest.put(Routes.applicationGuildCommands(clientId), { body: commands }); // For global commands

		log.info(`${data.length} 개의 슬래시 명령어 리로드 완료!`);
	} catch (error) {
		log.error(error);
	}
})();

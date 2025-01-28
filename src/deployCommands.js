const { REST, Routes } = require('discord.js');
const { clientId, devGuildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const log = require('./utils/logging');

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath).filter((file) => file !== '.DS_Store'); // MacOS .DS_Store 파일 제외

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			log.warn(`${filePath} 명령어에 필요한 "data" 또는 "execute" 속성이 누락되었습니다`);
		}
	}
}

const option = process.argv[2]; // Get the option from command line arguments

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		if (option === 'update-guild') {
			log.info(`${commands.length} 개의 길드 슬래시 명령어를 리로드 하는 중...`);
			const data = await rest.put(Routes.applicationGuildCommands(clientId, devGuildId), { body: commands });
			log.info(`${data.length} 개의 길드 슬래시 명령어 리로드 완료!`);
		} else if (option === 'update-global') {
			log.info(`${commands.length} 개의 전체 슬래시 명령어를 리로드 하는 중...`);
			const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
			log.info(`${data.length} 개의 전체 슬래시 명령어 리로드 완료!`);
		} else if (option === 'delete-guild') {
			log.info(`길드 슬래시 명령어를 삭제하는 중...`);
			await rest.put(Routes.applicationGuildCommands(clientId, devGuildId), { body: [] });
			log.info(`길드 슬래시 명령어 삭제 완료!`);
		} else if (option === 'delete-global') {
			log.info(`전체 슬래시 명령어를 삭제하는 중...`);
			await rest.put(Routes.applicationCommands(clientId), { body: [] });
			log.info(`전체 슬래시 명령어 삭제 완료!`);
		} else {
			log.error('올바른 옵션을 제공하세요: update-guild, update-global, delete-guild, delete-global');
		}
	} catch (error) {
		log.error(error);
	}
})();

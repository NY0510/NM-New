const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const log = require('./utils/logging');
const config = require('./config.json');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

global.log = log;
client.rootPath = __dirname;
client.config = config;
client.config.version = require('../package.json').version;
client.defaultVolume = 100;
require('./utils/lavalink')(client);

// 커맨드 핸들러
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath).filter((file) => file !== '.DS_Store'); // MacOS .DS_Store 파일 제외
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			log.warn(`${filePath} 명령어에 필요한 "data" 또는 "execute" 속성이 누락되었습니다.`);
		}
	}
}

// 이벤트 핸들러
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js') && file !== '.DS_Store'); // MacOS .DS_Store 파일 제외
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(client, ...args));
	} else {
		client.on(event.name, (...args) => event.execute(client, ...args));
	}
}

client.on('raw', (d) => client.manager.updateVoiceState(d));

// API 오류 핸들러
process.on('unhandledRejection', (error) => {
	log.error(`처리되지 않은 오류가 발생했습니다\nError:${error}`);
});

// 예기치 않은 오류 핸들러
process.on('uncaughtException', (error) => {
	log.error(`예기치 않은 오류가 발생했습니다\nError:${error}`);
});

client.login(config.token);

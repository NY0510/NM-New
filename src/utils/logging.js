const chalk = require("chalk");

module.exports = {
	info: (message) => console.log(`${chalk.blue("[INFO]")} ${message}`),
	warn: (message) => console.log(`${chalk.yellow("[WARNING]")} ${message}`),
	error: (message) => console.log(`${chalk.red("[ERROR]")} ${message}`),
	debug: (message) => console.log(`${chalk.green("[DEBUG]")} ${message}`),
	music: (message) => console.log(`${chalk.cyan("[MUSIC]")} ${message}`),
};

export function msToTime(ms) {
	const seconds = Math.floor(ms / 1000);
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	const formattedHours = String(hours).padStart(2, '0');
	const formattedMinutes = String(minutes).padStart(2, '0');
	const formattedSeconds = String(remainingSeconds).padStart(2, '0');

	return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
export function textLengthOverCut(txt, len = 20, lastTxt = '...') {
	if (Array.from(txt).length > len) {
		txt = txt.substr(0, len) + lastTxt;
	}
	return txt;
}
export function hyperlink(text, url) {
	return `[${text.replaceAll('[', '［').replaceAll(']', '］')}](<${url}>)`;
}
export function progressBar(player) {
	//[ ●▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ]
	const progress = (Math.floor(player.position / 1000) / Math.floor(player.queue.current.duration / 1000)) * 100;
	let bar = '';
	for (let i = 0; i != Math.floor((progress * 1.5) / 10); i++) {
		bar += '▬';
	}
	bar += '●';
	for (let i = 15; i != Math.floor((progress * 1.5) / 10); i--) {
		bar += '▬';
	}
	return `**[ ${bar} ]**`;
}

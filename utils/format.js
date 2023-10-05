module.exports = {
	msToTime: (ms) => {
		const seconds = Math.floor(ms / 1000);
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;

		const formattedHours = String(hours).padStart(2, "0");
		const formattedMinutes = String(minutes).padStart(2, "0");
		const formattedSeconds = String(remainingSeconds).padStart(2, "0");

		return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
	},

	textLengthOverCut: (txt, len = 20, lastTxt = "...") => {
		if (Array.from(txt).length > len) {
			txt = txt.substr(0, len) + lastTxt;
		}
		return txt;
	},

	hyperlink: (text, url) => {
		return `[${text.replaceAll("[", "［").replaceAll("]", "］")}](${url})`;
	},
};

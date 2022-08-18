import { addReaction, sendMessage } from "./slack.js";
import { psychostreamer, gpd3 } from "./generators.js";

const memory = {};

export const bobby = event => {
	if (
		event.type === "message" &&
		event.bot_id !== "B03TUFJ194N" &&
		event.message?.bot_id !== "B03TUFJ194N"
	) {
		// React with :hehehe: to any youtube link
		if (
			event.text?.includes("youtube.com") ||
			event.text?.includes("youtu.be")
		) {
			addReaction(event.channel, "hehehe", event.event_ts);
			return;
		}

		// React with :robot_love: to anyhting slackbot says
		if (event.user === "USLACKBOT") {
			addReaction(event.channel, "robot_love", event.event_ts);
			return;
		}

		if (event.text) {
			if (!(event.channel in memory)) {
				memory[event.channel] = [];
			}

			// Respond to the message, with a special case for news
			if (event.text?.toLowerCase().includes("news")) {
				const headline = psychostreamer();

				memory[event.channel].push(
					`[Human ${event.user}] ${event.text}`
				);
				memory[event.channel].push(`[News Headline] ${headline}`);

				const history = memory[event.channel].join("\n\n");

				gpd3(history, headline).then(response => {
					const response_text = response.choices[0].text;

					memory[event.channel].push(
						`[Bobby Bicycle] ${response_text}`
					);

					sendMessage(
						event.channel,
						`> ${headline}\n${response_text}`
					);
				});
			} else {
				const history = memory[event.channel].join("\n\n");

				gpd3(history, event.text).then(response => {
					console.log(response);

					const response_text = response.choices[0].text.trim();

					memory[event.channel].push(
						`[Human ${event.user}] ${event.text}`
					);

					if (/^:\w+:$/.test(response_text)) {
						addReaction(
							event.channel,
							response_text.slice(1, -1),
							event.event_ts
						);
					} else {
						memory[event.channel].push(
							`[Bobby Bicycle] ${response_text}`
						);

						sendMessage(event.channel, response_text);
					}

					if (memory[event.channel].length > 40) {
						memory[event.channel] = memory[event.channel].slice(
							memory[event.channel].length - 40
						);
					}
				});
			}
		}
	}
};
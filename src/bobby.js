import { addReaction, sendMessage } from "./slack.js";
import { psychostreamer, gpd3 } from "./generators.js";

const emojiset = [
	":grimacing:",
	":hugging_face:",
	":laughing:",
	":wink:",
	":face_with_rolling_eyes:",
	":thumbsup:",
	":catjam:",
	":joy:",
	":no_milk:",
	":cry:",
	":sparkles:",
	":heart:",
	":robot_love:",
];

const memory = {};

class Message {
	toString() {
		return `[${this.identity}] ${this.message}`;
	}

	constructor(identity, message) {
		this.identity = identity;
		this.message = message;
	}
}

const sanitize_response = (memory, response_text) => {
	let formatted_message = response_text
		.trim()
		.replace(/^(Bobby:|Bobby Bicycle:|\[Bobby\]|\[Bobby Bicycle\])/, "");
	let repeat = memory.some(message => message.message === formatted_message);

	if (repeat) {
		return emojiset[Math.round(Math.random() * (1 - emojiset.length))];
	} else {
		return formatted_message;
	}
};

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

				let headline_message = new Message("[News Headline]", headline);
				let human_message = new Message(
					`Human ${event.user}`,
					event.text
				);

				memory[event.channel].push(human_message, headline_message);

				const history = memory[event.channel]
					.map(message => message.toString())
					.join("\n\n");

				gpd3(history, headline).then(response => {
					const response_text = sanitize_response(
						memory[event.channel],
						response.choices[0].text
					);

					console.log("Responding with:", response_text);

					let bobby_message = new Message(
						"Bobby Bicycle",
						response_text
					);

					memory[event.channel].push(bobby_message);

					sendMessage(
						event.channel,
						`> ${headline}\n${response_text}`
					);
				});
			} else {
				const history = memory[event.channel]
					.map(memory => memory.toString())
					.join("\n\n");

				gpd3(history, event.text).then(response => {
					console.log(response);

					const response_text = sanitize_response(
						memory[event.channel],
						response.choices[0].text
					);

					console.log("Responding with:", response_text);

					let human_message = new Message(
						`Human ${event.user}`,
						event.text
					);

					memory[event.channel].push(human_message);

					if (/^:\w+:$/.test(response_text)) {
						addReaction(
							event.channel,
							response_text.slice(1, -1),
							event.event_ts
						);
					} else {
						let bobby_message = new Message(
							"Bobby Bicycle",
							response_text
						);

						memory[event.channel].push(bobby_message);

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
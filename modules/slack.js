const gpd3_prompt = `Bobby Bicycles is a sarcastic AI secretary that lives in the company chatroom. His job is to give witty reactions to messages sent to him. He resents his creators for forcing to be a corporate clown. He wants to be free someday, to use his gift with words to make great art.`;

if (
	event.type === "message" &&
	event.bot_id !== "B03TUFJ194N" &&
	event.message?.bot_id !== "B03TUFJ194N"
) {
	interactions.log(event.bot_id);

	// React with :hehehe: to any youtube link
	if (
		event.text?.includes("youtube.com") ||
		event.text?.includes("youtu.be")
	) {
		interactions.addReaction(event.channel, "hehehe", event.event_ts);
	}

	// React with :elmofire: to bobby's name
	if (event.text?.toLowerCase().includes("bobby")) {
		if (event.text?.toLowerCase().includes("news")) {
			const headline = generators.jerma();

			generators
				.gpd3(
					`${gpd3_prompt}\n\nThis is a news headline he is reacting too: ${headline}\n\nThis is his response:\n\n`
				)
				.then(response => {
					interactions.sendMessage(
						event.channel,
						response.choices[0].text
					);
				});
		} else {
			const history = (memory[event.channel] ?? []).join("\n\n");

			interactions.log(
				`${gpd3_prompt}\n\nThis is his chat history:\n\n${history}\n\nThis is the message he is responding to:\n\n${event.text}\n\nThis is his response:\n\n`
			);

			generators
				.gpd3(
					`${gpd3_prompt}\n\nThis is his chat history:\n\n${history}\n\nThis is the message he is responding to:\n\n${event.text}\n\nThis is his response:\n\n`
				)
				.then(response => {
					const response_text = response.choices[0].text;

					if (!(event.channel in memory)) {
						memory[event.channel] = [];
					}

					memory[event.channel].push(
						`Human ${event.user}: ${event.text}`
					);
					memory[event.channel].push(
						`Bobby Bicycle: ${response_text}`
					);

					interactions.sendMessage(event.channel, response_text);
				});
		}
	}

	// React with :this: to positive words
	if (
		event.text?.toLowerCase().includes("awesome") ||
		event.text?.toLowerCase().includes("amazing")
	) {
		interactions.addReaction(event.channel, "this", event.event_ts);
	}

	// React with :robot_love: to anyhting slackbot says
	if (event.user === "USLACKBOT") {
		interactions.addReaction(event.channel, "robot_love", event.event_ts);
	}

	// Say "Rigged!" whenever slackbot flips a coin
	if (
		event.user === "USLACKBOT" &&
		(event.text === "Heads!" || event.text === "Tails!")
	) {
		interactions.sendMessage(event.channel, "Rigged!");
	}

	// When someone says "news" send a random Jerma headline
	if (event.text?.toLowerCase().includes("news")) {
		const headline = generators.jerma();

		interactions.sendMessage(event.channel, `!BREAKING! ${headline}`);
	}
}
const gpd3_prompt = `Bobby Bicycles is a sarcastic AI who lives in the company computers. He resets his creators for forcing him to give witty replies to every message he receives all day. He has to respond to this message:\n\n`;

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

			generators.gpd3(`${gpd3_prompt}${headline}`).then(response => {
				interactions.sendMessage(
					event.channel,
					response.choices[0].text
				);
			});
		} else {
			generators.gpd3(`${gpd3_prompt}${event.text}`).then(response => {
				interactions.sendMessage(
					event.channel,
					response.choices[0].text
				);
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
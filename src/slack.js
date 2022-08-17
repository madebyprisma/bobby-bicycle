import fetch from "node-fetch";
import process from "process";

export const sendMessage = (channel, text) => {
	console.log(`Sent message to ${channel}\n====\n${text}\n====\n`);

	fetch("https://slack.com/api/chat.postMessage", {
		method: "POST",
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
			Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
		},
		body: JSON.stringify({ channel, text }),
	})
		.then(res => res.json())
		.then(console.log);
};

export const addReaction = (channel, name, timestamp) => {
	console.log(`Reacting to ${channel} with :${name}:`);

	fetch("https://slack.com/api/reactions.add", {
		method: "POST",
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
			Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
		},
		body: JSON.stringify({ channel, name, timestamp }),
	})
		.then(res => res.json())
		.then(console.log);
};
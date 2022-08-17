import express from "express";
import bodyParser from "body-parser";
import vm from "vm";
import { readFileSync } from "fs";
import fetch from "node-fetch";
import process from "process";

const app = express();

const sendMessage = (channel, text) => {
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

const addReaction = (channel, name, timestamp) => {
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

app.use(bodyParser.json());

app.use("/slack/events", (request, response) => {
	console.log("====", request.method, "====");

	if (request.method === "POST") {
		console.log(request.body);

		if (request.body.challenge) {
			console.log(`Challange ${request.body.token}`);
			response.write(request.body.challenge);
			response.end();
		} else {
			let context = vm.createContext({
				event: request.body.event,
				interactions: {
					log: console.log,
					sendMessage,
					addReaction,
				},
			});

			let script = new vm.Script(
				readFileSync("./modules/slack.js").toString()
			);

			script.runInContext(context);

			response.end();
		}
	} else {
		response.write("This is the slack endpoints");
		response.end();
	}
});

app.listen(8080);
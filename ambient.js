import express from "express";
import bodyParser from "body-parser";
import vm from "vm";
import { readFileSync } from "fs";
import fetch from "node-fetch";
import process, { env } from "process";

const resolve_generator = (struct, emit) => {
	const term_regexp = /\[\w+\]/g;

	const input = text => {
		let working = text.toString();
		let terms = text.match(term_regexp);

		if (terms) {
			for (let subset of terms) {
				let term = subset.slice(1, -1);

				if (term in struct) {
					if (struct[term] instanceof Array) {
						let choice =
							struct[term][
								Math.round(
									Math.random() * (struct[term].length - 1)
								)
							];
						let content = input(choice);

						working = working.replace(subset, content);
					}
				}
			}
		}

		return working;
	};

	if (emit in struct) {
		return input(struct[emit]);
	} else {
		return `term "${emit}" not in generator struct`;
	}
};

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

const jerma = () => {
	const jerma_generator = JSON.parse(
		readFileSync("./generators/psychostreamer.json").toString()
	);

	return resolve_generator(jerma_generator, "output");
};

const gpd3 = prompt => {
	return fetch("https://api.openai.com/v1/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${env.GPD3_TOKEN}`,
		},
		body: JSON.stringify({
			prompt,
			model: "text-davinci-002",
			temperature: 0.85,
			max_tokens: 512,
		}),
	}).then(res => res.json());
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
				generators: {
					jerma,
					gpd3,
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
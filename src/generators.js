import { readFileSync } from "fs";
import process from "process";
import fetch from "node-fetch";

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

export const psychostreamer = () => {
	const jerma_generator = JSON.parse(
		readFileSync("./generators/psychostreamer.json").toString()
	);

	return resolve_generator(jerma_generator, "output");
};

export const gpd3 = (history, message) => {
	let prompt = readFileSync("./generators/prompt.txt").toString();

	prompt = prompt.replace("{{history}}", history);
	prompt = prompt.replace("{{message}}", message);

	console.log(`Generating response for "${message}"\nHistory:\n${history}`);

	return fetch("https://api.openai.com/v1/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.GPD3_TOKEN}`,
		},
		body: JSON.stringify({
			prompt,
			model: "text-davinci-002",
			temperature: 0.85,
			max_tokens: 512,
		}),
	}).then(res => res.json());
};
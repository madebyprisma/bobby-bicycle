import express from "express";
import bodyParser from "body-parser";
import { bobby } from "./bobby.js";

const app = express();

app.use(bodyParser.json());

app.use("/slack/events", (request, response) => {
	console.log(request.method);

	if (request.method === "POST") {
		if (request.body.challenge) {
			console.log(`Challange ${request.body.token}`);
			response.write(request.body.challenge);
			response.end();
		} else {
			console.log(`Recieved ${request.body.event.type}`);
			bobby(request.body.event);

			response.end();
		}
	} else {
		response.write("This is the slack endpoints");
		response.end();
	}
});

app.listen(8080);
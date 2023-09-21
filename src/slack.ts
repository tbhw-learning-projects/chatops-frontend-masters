import type { Handler } from '@netlify/functions';
import { isSlackEvent, slackApi } from './util/slack';
import { parse } from 'querystring';

export const handler: Handler = async (event) => {
	if (!isSlackEvent(event)) {
		return {statusCode: 400, body: "Invalid Request"}
	}

	const body = parse(event.body ?? "") as SlackPayload;
	if (body.command) {
		return handleSlashCommand(body as SlackSlashCommandPayload);
	}

	// TODO handle interactivity (e.g. context commands, modals)

	return {
		statusCode: 200,
		body: 'TODO: handle Slack commands and interactivity',
	};
};

async function handleSlashCommand(payload: SlackSlashCommandPayload) {
	switch(payload.command) {
		case "/fight":{
			const jokeResponse = await fetch("https://icanhazdadjoke.com", {headers: {accept: "text/plain"}}) 
				const response = await slackApi("chat.postMessage", {channel: payload.channel_id, text: await jokeResponse.text()})
				
				if (!response.ok) {
					console.log(response);
				}

		  break;
		}
		default: 
		  return {statusCode: 200, body: `Command "${payload.command}" is not recognized.`}
	}

	return {statusCode: 200, body: ""}
}

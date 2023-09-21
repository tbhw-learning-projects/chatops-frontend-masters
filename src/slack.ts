import type { Handler } from '@netlify/functions';
import { slackApi } from './util/slack';
import { parse } from 'querystring';

export const handler: Handler = async (event) => {
	// TODO validate the Slack request

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
		case "/fight": 
		  const response = await slackApi("chat.postMessage", {channel: payload.channel_id, text: "Things are happening"})

		  if (!response.ok) {
			console.log(response);
		  }
		  break;
		default: 
		  return {statusCode: 200, body: `Command "${payload.command}" is not recognized.`}
	}

	return {statusCode: 200, body: ""}
}

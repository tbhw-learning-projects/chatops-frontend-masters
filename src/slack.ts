import type { Handler } from '@netlify/functions';
import { isSlackEvent, slackApi, modal, blocks } from './util/slack';
import { parse } from 'querystring';
import { CallbackId, Channels } from './constants';
import { saveItem } from './util/notion';

export const handler: Handler = async (event) => {
	if (!isSlackEvent(event)) {
		return {statusCode: 400, body: "Invalid Request"}
	}

	const body = parse(event.body ?? "") as SlackPayload;

	if (body.command) {
		return handleSlashCommand(body as SlackSlashCommandPayload);
	}
	
	if (body.payload) {
		return handleInteractivity(JSON.parse(body.payload));
	}

	return {
		statusCode: 200,
		body: 'TODO: handle Slack commands and interactivity',
	};
};

async function handleSlashCommand(payload: SlackSlashCommandPayload) {
	switch (payload.command) {
		case "/fight": {

			const response = await slackApi(
				"views.open",
				modal({
					id: CallbackId.FoodFight, title: "Start a food fight", trigger_id: payload.trigger_id, blocks: [
						blocks.section({ text: "The discourse demands food drama! *Send in your spiciest food takes so we can all argue about them and feel alive*" }),
						blocks.input({ id: "opinion", label: "Deposit your controversial food opinions here...", placeholder: "Example: \"Peanut butter and mayo sandwiches are delicious\"", initial_value: payload.text, hint: "What do you believe about food that people find appalling? Say it with your chest." }),
						blocks.select({ id: "spice_level", label: "How spice is this opinion?", placeholder: "Select a spice level", options: [{ label: "🌶️", value: "1" }, { label: "🌶️🌶️", value: "2" }, { label: "🌶️🌶️🌶️", value: "3" }, { label: "🌶️🌶️🌶️🌶️", value: "4" }] })
					]
				})
			);

			if (!response.ok) {
				console.log(response);
			}

			break;
		}
		default:
			return { statusCode: 200, body: `Command "${payload.command}" is not recognized.` };
	}

	return { statusCode: 200, body: "" };
}

async function handleInteractivity(payload: SlackModalPayload) {
	const callback_id = payload.callback_id ?? payload.view.callback_id;

	switch (callback_id) {
		case CallbackId.FoodFight: {
			const data = payload.view.state.values;
			const fields = {
				opinion: data.opinion_block.opinion.value,
				spiceLevel: data.spice_level_block.spice_level.selected_option.value,
				submitter: payload.user.name
			};

			await slackApi("chat.postMessage", { channel: Channels.BotTesting, text: `Oh, snap!${":hot_pepper:".repeat(parseInt(fields.spiceLevel, 10))}\n\n <@${fields.submitter}> just started a food fight! :eyes:\n\nTake:\n>*${fields.opinion}*` });
			await saveItem(fields);
			break;
		}
		case CallbackId.FoodFightNudge: {
			const channel = payload.channel?.id ?? Channels.BotTesting;
			const user_id = payload.user.id;
			const thread_ts = payload.message.thread_ts ?? payload.message.ts;

			await slackApi("chat.postMessage", { channel, thread_ts, text: `Hey <@${user_id}>, an opinion like this one deserves a heated public debate.  I'll go ahead and start one for you!` });
			break;
		}
		default: {
			const text = `No handler defined for ${callback_id}`;
			return { statusCode: 400, body: text };
		}

	}
	return { statusCode: 200, body: "" };
}

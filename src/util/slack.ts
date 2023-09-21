import { HandlerEvent } from "@netlify/functions";
import { createHmac } from "crypto";

export async function slackApi(endpoint:SlackApiEndpoint, body: SlackApiRequestBody) {
    const response = await fetch(`https://slack.com/api/${endpoint}`, {method: "POST", headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_OAUTH_TOKEN ?? "Undefined Slack Bot Token"}`,
        'Content-Type': "application/json; charset=utf-8"
    },
    body: JSON.stringify(body)});

    return response.json();
}

export async function isSlackEvent(event: HandlerEvent) {
    const secret = process.env.SLACK_SIGNING_SECRET;
    const signature = event.headers['x-slack-signature'];
    const timestamp = Number(event.headers['x-slack-request-timestampe']);
    const currentTime = Math.floor(Date.now() / 1000);

    if (Math.abs(currentTime - timestamp) > 300) {
        return false;
    }

    if (!secret) {
        console.error("Slack signing secret cannot be undefined");
        return false;
    }

    const hash = createHmac("sha256", secret)
        .update(`v0:${timestamp}:${event.body}`)
        .digest("hex");

    return `v0=${hash}` === signature;
}


export const blocks = {
    section({ text }: SectionBlockArgs): SlackBlockSection {
        return { type: "section", text: { type: "mrkdwn", text } };
    },
    input({
        id,
        label,
        placeholder,
        initial_value = "",
        hint = "",
    }: InputBlockArgs): SlackBlockInput {
        return {
            type: "input",
            block_id: `${id}_block`,
            label: {
                type: "plain_text",
                text: label,
            },
            element: {
                action_id: id,
                type: "plain_text_input",
                placeholder: {
                    type: "plain_text",
                    text: placeholder,
                },
                initial_value,
            },
            hint: {
                type: "plain_text",
                text: hint,
            },
        };
    },
    select({
        id,
        label,
        placeholder,
        options,
    }: SelectBlockArgs): SlackBlockInput {
        return {
            type: "input",
            block_id: `${id}_block`,
            label: {
                type: "plain_text",
                text: label,
            },
            element: {
                action_id: id,
                type: "static_select",
                placeholder: {
                    type: "plain_text",
                    text: placeholder,
                },
                options: options.map(({ label, value }) => ({
                    text: { type: "plain_text", emoji: true, text: label },
                    value,
                })),
            },
        };
    },
};

export function modal({
    trigger_id,
    id,
    title,
    submit_text = "submit",
    blocks,
}: ModalArgs) {
    return {
        trigger_id,
        view: {
            type: "modal",
            callback_id: id,
            title: {
                type: "plain_text",
                text: title,
            },
            submit: {
                type: "plain_text",
                text: submit_text,
            },
            blocks,
        },
    };
}

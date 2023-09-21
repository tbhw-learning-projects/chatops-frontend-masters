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

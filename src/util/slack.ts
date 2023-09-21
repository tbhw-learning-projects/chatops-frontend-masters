export async function slackApi(endpoint:SlackApiEndpoint, body: SlackApiRequestBody) {
    const response = await fetch(`https://slack.com/api/${endpoint}`, {method: "POST", headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_OAUTH_TOKEN ?? "Undefined Slack Bot Token"}`,
        'Content-Type': "application/json; charset=utf-8"
    },
    body: JSON.stringify(body)});

    return response.json();
}

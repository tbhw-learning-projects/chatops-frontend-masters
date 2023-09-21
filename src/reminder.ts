import { schedule } from "@netlify/functions";
import { Channels } from "./constants";
import { getNewItems } from "./util/notion";
import { blocks, slackApi } from "./util/slack";

async function postNewNotionItemsToSlack() {
    const items = await getNewItems();

    await slackApi("chat.postMessage", {channel: Channels.BotTesting, blocks: [
        blocks.section({text: ["Here are the opinions awaiting judgement", "", ...items.map(item => `- ${item.opinion} (spice level: ${":hot_pepper:".repeat(parseInt(item.spiceLevel, 10))})`), "", `See all items <https://notion.com/${process.env.NOTION_DATABASE_ID} |in Notion>`].join("\n")})
    ]}
    );

    return {statusCode: 200}
}


export const handler = schedule("0 13 * * 1", postNewNotionItemsToSlack)

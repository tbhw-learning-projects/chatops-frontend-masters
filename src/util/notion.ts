export async function notionApi(endpoint: string, body: {}) {
    try {
        const response = await fetch(`https://api.notion.com/v1${endpoint}`, {method: "POST", headers: {"accept": "application/json", Authorization: `Bearer ${process.env.NOTION_SECRET}`, 'Notion-Version': "2022-06-28", "content-type": "application/json"}, body: JSON.stringify(body)})
        if (!response.ok) {
            throw new Error("Something went wrong");
        }
        return response?.json();
    } catch (e) {
        console.error(e);
    }
}

export async function getNewItems(): Promise<NewItem[]> {
    const notionData = await notionApi(`/databases/${process.env.NOTION_DATABASE_ID}/query`, {filter: {property: "Status", status: {equals: "new"}}, page_size: 100});
    return notionData.results.map((item: NotionItem) => ({opinion: item.properties.opinion.title[0].text.content, spiceLevel: item.properties.spiceLevel.select.name, status: item.properties.Status.status.name}))
}

export async function saveItem(item: NewItem) {
    return notionApi(`/pages`, {parent: {database_id: process.env.NOTION_DATABASE_ID}, properties: {
        opinion: {title: [{text: {content: item.opinion}}]}, spiceLevel: {select: {name: item.spiceLevel}}, submitter: {rich_text: [{text: {content: `@${item.submitter} on Slack`}}]}}
    });
    
}

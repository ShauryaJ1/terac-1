import { Stagehand } from "@browserbasehq/stagehand";

async function main() {
	const stagehand = new Stagehand({
		/**
		 * With npx create-browser-app, this config is found 
		 * in a separate stagehand.config.ts file
		*/
		env: "LOCAL",
		modelName: "gpt-4o",
		modelClientOptions: {
			apiKey: process.env.OPENAI_API_KEY,
		},
	});
	await stagehand.init();

	const page = stagehand.page;

	await page.goto("https://www.google.com");
	await page.act("Type in 'Browserbase' into the search bar");

	const { title } = await page.extract({
		instruction: "The title of the first search result",
		schema: z.object({
			title: z.string(),
		}),
	});
	

	await stagehand.close();
}

main();
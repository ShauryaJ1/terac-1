const page = stagehand.page
// Navigate to the URL
await page.goto("https://linkedin.com");

await page.act("click 'jobs'");
await page.act("click the first job posting");
const { jobTitle } = await page.extract({
	instruction: "Extract the job title from the job posting",
	schema: z.object({
		jobTitle: z.string(),
	}),
});
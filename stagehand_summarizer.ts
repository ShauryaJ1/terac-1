import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';
import 'dotenv/config';

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o-mini",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });
  
  try {
    await stagehand.init();
    const page = stagehand.page;

    // Navigate to the website with a longer timeout
    try {
      await page.goto("https://www.marblehillfarmin.com/", { timeout: 60000 }); // 60 second timeout
    } catch (error) {
      console.error("Failed to navigate to the website:", error);
      throw error; // Re-throw to be caught by outer try-catch
    }

    // Extract contact information
    const summary = await page.extract({
      instruction: "Summarize the page in 150 words or less. Return the name of the organization and the summary.",
      schema: z.object({
        summary: z.string(),
        name: z.string(),
      }),
    });

    console.log("Summary:", JSON.stringify(summary, null, 2));
    const contactInfo = await page.extract({
        instruction: "Extract all contact information entries from the page, including phone numbers, emails, and addresses. Return them as an array of contact entries.",
        schema: z.object({
          contacts: z.array(z.object({
            name: z.string().nullable().optional(),
            phone: z.string().nullable().optional(),
            email: z.string().email().nullable().optional(),
            address: z.string().nullable().optional(),
            role: z.string().nullable().optional(),
          })),
        }),
      });
      console.log("Contact Information:", JSON.stringify(contactInfo, null, 2));
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // This will run whether there was an error or not
    await stagehand.close();
  }
}

main().catch(console.error);

import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';
import 'dotenv/config';

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o-mini",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    }
  });
  
  try {
    await stagehand.init();
    const page = stagehand.page;

    // Navigate to the website
    await page.goto("https://crossroadsvet.net/contact/");
    await page.act("go to contact page");
    // const recaptcha = await page.goto("https://www.google.com/recaptcha/api2/demo");

    page.on("console", (msg) => {
      if (msg.text() == "browserbase-solving-started") {
        console.log("Captcha Solving In Progress");
      } else if (msg.text() == "browserbase-solving-finished") {
        console.log("Captcha Solving Completed");
      }
    });    
    // Handle captcha with explicit instruction
    await page.act("Solve any captcha on the page and continue with the form submission");

    // Extract contact information
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
  } finally {
    // This will run whether there was an error or not
    // await stagehand.close();
  }
}

main().catch(console.error);

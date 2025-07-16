import { Document } from "@langchain/core/documents";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pLimit from 'p-limit';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const openai = new OpenAI({
  baseURL: "https://api.novita.ai/v3/openai",
  apiKey: process.env.NOVITA_API_KEY as string,
});

export const summarizeCommit = async (diff: string) => {
  const prompt = `
  You are a code assistant summarizing git commit diffs. Your task is to provide a **concise, professional, and to-the-point** summary in **2-3 lines** that:
  
  - Clearly states the **purpose** of the changes.
  - Mentions **key files or components** affected.
  - Highlights important **additions, modifications, or deletions**.
  - **DO NOT** describe the diff line by line or explain reasoning steps.
  - **DO NOT** include phrases like "Okay, let's look at the diff" or any extra context.
  - **DO NOT** include explanations, reasoning, or step-by-step analysis.
  - The summary should read like a clean **git commit message**, without redundant explanations or unnecessary words.
  
  **Example of the expected summary:**  
  "Refactored Header component to improve navigation with updated UserButton and responsive logo styling. Enhanced AppLayout background with a radial gradient for better visual hierarchy."
  
  ### Rules:
  1. **Strictly follow the 2-3 line format.**
  2. **Do not include any explanations, reasoning, or step-by-step analysis.**
  3. **Do not use phrases like "Okay, let's look at the diff" or "First, I check the files."**
  4. **Focus only on the purpose, key files, and major changes.**
  
  ### Diff:
  \`\`\`diff
  ${diff}
  \`\`\`
  
  ### Summary (ONLY this, nothing else):
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Adjust model as needed
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();

    return summary || "No summary available";
  } catch (error) {
    console.error("❌ Error summarizing commit:", error);
    return "No summary available";
  }
};



const limit = pLimit(5);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if file should be skipped
const shouldSkipFile = (filename: string): boolean => {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.bmp'];
  const otherSkipExtensions = ['.pdf', '.zip', '.tar', '.gz', '.mp4', '.mp3', '.wav'];
  
  const extension = filename.toLowerCase().split('.').pop();
  return imageExtensions.includes(`.${extension}`) || otherSkipExtensions.includes(`.${extension}`);
};

export const getSummary = async (doc: Document) => {
  const filename = doc.metadata.source || '';
  
  // Skip image files and other non-code files
  if (shouldSkipFile(filename)) {
    console.log(`⏭️  Skipping ${filename} (image/binary file)`);
    return `Skipped: ${filename} is an image or binary file`;
  }
  
  if (doc.pageContent.length < 50) {
    return "File too small to summarize";
  }

  // Use p-limit to queue and control the API requests (3 concurrent)
  return limit(async () => {
    try {
      const prompt = `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects. 
      You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.

      Here is the code:
      ---
      ${doc.pageContent.slice(0, 10000)}
      ---`;

      const response = await openai.chat.completions.create({
        model: "google/gemma-3-27b-it",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
      });

      const content = response.choices?.[0]?.message?.content?.trim();

      if (!content) {
        console.error("❌ No valid response received from OpenAI.");
        return "No summary available";
      }

      console.log(`✅ Summary generated for: ${doc.metadata.source}`);
      
      
      
      return content;
    } catch (error:any) {
      console.error(`❌ Error summarizing ${doc.metadata.source}:`, error);
      
      if (error.status === 429) {
        // Wait longer on rate limit
        console.log(`⏳ Rate limited on ${doc.metadata.source}, waiting 3 seconds...`);
        await sleep(3000);
        return "Rate limit exceeded. Please try again later.";
      }
      
      return "No summary available";
    }
  });
};

export const getEmbeddings = async (summary: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });

    const embeddings = await model.embedContent(summary);
    const embedding = embeddings.embedding;
    return embedding.values;
  } catch (error) {
    console.error("❌ Error generating embeddings:", error);
    return [];
  }
};

import { Document } from "@langchain/core/documents";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1", // OpenRouter's OpenAI-compatible endpoint
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
    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Lower temperature for more deterministic and concise output
    });

    const summary = response.choices?.[0]?.message?.content?.trim();
    return summary || "No summary available";
  } catch (error) {
    console.error("❌ Error summarizing commit:", error);
    return "No summary available";
  }
};

const FREE_MODELS = [
  "deepseek/deepseek-v3-base:free",
  "allenai/molmo-7b-d:free",
  "bytedance-research/ui-tars-72b:free",
  "qwen/qwen2.5-vl-3b-instruct:free",
  "google/gemini-2.5-pro-exp-03-25:free",
  "qwen/qwen2.5-vl-32b-instruct:free",
  "deepseek/deepseek-chat-v3-0324:free",
  "featherless/qwerky-72b:free"
];

// Keep track of which model was last used
let currentModelIndex = 0;

export const getSummary = async (doc: Document) => {
  if (doc.pageContent.length < 50) {
    return "File too small to summarize";
  }
  
  // Maximum retry attempts
  const maxRetries = 3;
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      // Get the next model in rotation
      const model = FREE_MODELS[currentModelIndex];
      
      // Update the index for next call (circular rotation)
      currentModelIndex = (currentModelIndex + 1) % FREE_MODELS.length;
      
      const prompt = `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects. 
      You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.

      Here is the code:
      ---
      ${doc.pageContent.slice(0, 10000)}
      ---`;

      console.log(`Attempt ${attempts + 1}: Using model: ${model}`);
      
      const response = await openai.chat.completions.create({
        model: model!,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500, // Setting a reasonable token limit
      });

      const content = response.choices?.[0]?.message?.content?.trim();

      if (!content) {
        console.error(`No content in response for model ${model}:`, response);
        attempts++;
        // Wait a bit before trying the next model
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      console.log(`Success with model: ${model}`);
      return content;
      
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed with model ${FREE_MODELS[currentModelIndex - 1 >= 0 ? currentModelIndex - 1 : FREE_MODELS.length - 1]}:`, error);
      attempts++;
      
      // If we've reached max retries, return a fallback
      if (attempts >= maxRetries) {
        return "No summary available after trying multiple models. Please try again later.";
      }
      
      // Small delay before trying the next model
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return "No summary available";
}

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

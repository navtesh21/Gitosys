"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { getEmbeddings } from "./gemini";
import { db } from "@/server/db";
import OpenAI from "openai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const openai = new OpenAI({
  baseURL: "https://api.novita.ai/v3/openai",
  apiKey: process.env.NOVITA_API_KEY as string,
});
export async function askQuestion(question: string, projectId: string) {
  console.log(
    "[askQuestion] Received question:",
    question,
    "for project:",
    projectId,
  );
  const queryVector = await getEmbeddings(question);
  console.log("[askQuestion] Query vector:", queryVector);
  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = (await db.$queryRaw`
    SELECT "fileName","sourceCode","summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    Limit 10   `) as {
    fileName: string;
    sourceCode: string;
    summary: string;
  }[];
  console.log("[askQuestion] DB result count:", result.length);

  let context = "";
  for (const { fileName, sourceCode, summary } of result) {
    context += `File: ${fileName}\nCode: ${sourceCode}\nSummary: ${summary}\n\n`;
  }
  console.log(
    "[askQuestion] Context block generated:",
    context.length,
    "characters",
  );

  const prompt = `You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern working on the project.

AI assistant is a brand new, powerful, human-like artificial intelligence.
The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is a well-behaved and well-mannered individual.
AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question.
If the question is asking about code or a specific file, AI will provide the detailed answer, giving step-by-step instructions.

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
If the context does not provide the answer to the question, the AI assistant will say, "I'm sorry, but I don't know the answer."
AI assistant will not apologize for previous responses, but instead will indicate that new information was gained.
AI assistant will not invent anything that is not drawn directly from the context.
Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering.
`;
  console.log("[askQuestion] Prompt generated:", prompt.length, "characters");
  const response = await openai.chat.completions.create({
    model: "google/gemma-3-27b-it",
    messages: [
      {
        role: "user",
        content: prompt, // Use the prompt, not doc.pageContent
      },
    ],
    temperature: 0.1,
  });

  const text = response.choices?.[0]?.message?.content?.trim();
  if (!text) {
    console.error("❌ No valid response received from OpenAI.");
    return "No summary available";
  }
  console.log("[askQuestion] OpenAI response:", text);
  return {
    text,
    result,
  };
}

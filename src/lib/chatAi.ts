"use server"

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { getEmbeddings } from "./gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const queryVector = await getEmbeddings(question);
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

  let context = "";

  for (const { fileName, sourceCode, summary } of result) {
    context += `File: ${fileName}\nCode: ${sourceCode}\nSummary: ${summary}\n\n`;
  }

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
  const { text } = await generateText({
    model: google("gemini-1.5-pro-latest"),
    prompt: prompt,
  });
  return {
    text,
    result,
  };
}

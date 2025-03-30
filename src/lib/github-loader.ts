import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { getEmbeddings, getSummary } from "./gemini";
import { Document } from "@langchain/core/documents";
import { Prisma } from "@prisma/client";
import { db } from "@/server/db";

export const githubLoader = async ({
  githubUrl,
  githubToken,
}: {
  githubUrl: string;
  githubToken?: string;
}) => {
  const loader = new GithubRepoLoader(githubUrl, {
    branch: "main",
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5, // Defaults to 2
    accessToken: githubToken || "",
    ignoreFiles: [
      "package.json",
      "package-lock.json",
      "yarn.lock",
      "node_modules",
      "tsconfig.json",
      "tsconfig.*.json",
      ".env",
      ".env.*",
      ".gitignore",
      ".git",
      "*.svg",
      "*.png",
      "*.jpg",
      "*.jpeg",
      "*.gif",
      "*.ico",
      "*.woff",
      "*.ttf",
      "*.eot",
      "*.map",
      "*.min.js",
      "*.min.css",
      "dist",
      "build",
      ".next",
      ".cache",
      "coverage",
      "public/assets",
      "public/images",
      ".DS_Store",
      "Thumbs.db",
    ],
  });
  const docs = await loader.load();
  console.log(docs[0]);
  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await githubLoader({ githubUrl, githubToken });

  const first10docs = docs.slice(0, 10);
  const allEmbeddings = await generateEmbeddings(first10docs);
  await Promise.all(
    allEmbeddings.map(async (embedding, index) => {
      console.log(
        "Processing document",
        index + 1,
        "of",
        allEmbeddings.length,
        embedding.filename,
      );
      if (!embedding) return;
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          sourceCode: embedding.source,
          fileName: embedding.filename || "",
          summary: embedding.summary || "",
          projectId,
        },
      });

      await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding.embeddings}::vector
      WHERE "id" = ${sourceCodeEmbedding.id}
      `;
    }),
  );
};

const generateEmbeddings = async (docs: Document[]) => {
  const summaries = await Promise.all(
    docs.map(async (doc: Document) => {
      const summary = await getSummary(doc);
      const embeddings = await getEmbeddings(summary!);
      return {
        summary,
        embeddings,
        source: JSON.parse(JSON.stringify(doc.pageContent)),
        filename: doc.metadata.source,
      };
    }),
  );

  return summaries;
};

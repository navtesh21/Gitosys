import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios"
import { summarizeCommit } from "./gemini";

export const octoKit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // GitHub personal access token
});

export const getCommits = async (githubUrl:string) => {
    const owner = githubUrl.split("/")[3];
    const repo = githubUrl.split("/")[4];
    if (!owner || !repo) {
      return [];
    }
  const commits = await octoKit.request("GET /repos/{owner}/{repo}/commits", {
    owner,
    repo,
  });

  const sortedCommits = commits.data.sort((a: any, b: any) => {
    return (
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime()
    );
  });


  return sortedCommits.slice(0, 15).map((commit: any) => {
    return {
      commitHash: commit.sha as string,
      commitMessage: commit.commit.message,
      commitAuthorName: commit.commit.author.name,
      commitDate: commit.commit.author.date,
      commitAuthorAvator: commit.author?.avatar_url,
    };
  });
};


const aiSummarize = async (githubUrl: string, hash: string) => {
  try {
    const change = await axios.get(`${githubUrl}/commit/${hash}.diff`, {
      headers: {
        Accept: 'application/vnd.github.v3.diff',
      },
    });
    return (await summarizeCommit(change.data)) || 'No summary available';
  } catch (error) {
    console.error(`Error summarizing commit ${hash}:`, error);
    return 'No summary available';
  }
};

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commits = await getCommits(githubUrl);
  const unProccessedComments = await filterUnprocessedCommits(projectId, commits);

  const summaryPromises = unProccessedComments.map((commit,index) =>
    aiSummarize(githubUrl, commit.commitHash)
  );
  

  const results = await Promise.allSettled(summaryPromises);

  const summaries = results.map((result) =>
    result.status === 'fulfilled' ? result.value : 'N/A'
  );

  console.log(unProccessedComments[0]?.commitAuthorAvator,"unProccessedComments[0].commitAuthorAvator")

  await db.commit.createMany({
    data: unProccessedComments.map((commit, index) => ({
      commitHash: commit.commitHash,
      commitMessage: commit.commitMessage,
      commitAuthorName: commit.commitAuthorName,
      commitDate: commit.commitDate,
      CommitAuthorAvatar: commit.commitAuthorAvator || " ", 
      summary: summaries[index] || 'No summary available',
      projectId: projectId,
    })),
    skipDuplicates: true,
  });
  

  return summaries;
};


const fetchProjectGithubUrl = async  (projectId:string) => {
    const project = await db.project.findUnique({
        where:{
        id:projectId
        }
        ,select:{
            githubUrl:true
        }
    })

    if(!project?.githubUrl){
        throw new Error("Project not found")
    }
    
    return {project,githubUrl:project?.githubUrl}
    
}

const filterUnprocessedCommits = async (projectId:string,commits:any[]) => {
    const processedCommits = await db.commit.findMany({
        where:{
            projectId
        }
    })

    const processedCommitsHashes = processedCommits.map(commit=>commit.commitHash)

    const unProcessedCommits = commits.filter(commit=>!processedCommitsHashes.includes(commit.commitHash))

    return unProcessedCommits
}
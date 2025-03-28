import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_KEY!,
});


function msTOTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  return `${hours}:${minutes}:${seconds}`;
}

export const processMeeting = async (url: string) => {
  const transcript = await client.transcripts.transcribe({
    audio: url,
    auto_chapters: true,
  });
  if(!transcript.text) return [];
  const summaries =
    transcript.chapters?.map((chapter) => ({
      start: msTOTime(chapter.start),
      end: msTOTime(chapter.end),
      gist: chapter.gist,
      headline: chapter.headline,
      summary: chapter.summary,
    })) || [];

  return summaries;
};


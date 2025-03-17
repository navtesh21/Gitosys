"use client";
import useProject from "@/hooks/use-Project";
import { getCommits } from "@/lib/github";
import { useUser } from "@clerk/nextjs";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";

function page() {
  const { project } = useProject();
  return (
    <div className="">
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        <div className="w-fit rounded-md bg-primary px-4 py-3 flex items-center ">
          <Github className="sixe-3 text-white"></Github>
          <div className="ml-1">
            <p className="text-sm font-medium text-white">
              This project is linked to {" "}
              <Link
                href={project?.githubUrl || ""}
                className="inline-flex items-center text-white/80 hover:underline"
              >
                {project?.githubUrl}
                <ExternalLink className="ml-1 size-4" />
              </Link>
            </p>
          </div>
        </div>
        invitemembers archive
      </div>

      <div className="mt-4">
      <div className=" grid grid-cols-1 sm:grid-cols-5 gap-4">
        <AskQuestionCard />
        meeting
      </div>
      </div>
      <div className="mt-8 flex flex-col gap-4">
        <CommitLog />
      </div>
    </div>
  );
}

export default page;

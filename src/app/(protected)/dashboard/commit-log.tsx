import useProject from "@/hooks/use-Project";
import React from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type Props = {};

function CommitLog({}: Props) {
  const { projectId, project } = useProject();

  const { data } = api.project.getProjectCommits.useQuery({ projectId });

  return (
    <ul className="space-y-6">
      {data?.map((commit, index) => (
        <li className="relative flex gap-x-4" key={index}>
          <div
            className={`${data.length - 1 === index ? "h-8" : "-bottom-8"} absolute left-0 top-0 flex w-6 justify-center`}
          >
            <div className="w-px translate-x-1 bg-gray-200"></div>
          </div>
          <>
            <img
              src={commit.CommitAuthorAvatar}
              alt="commit avatar"
              className="dize-8 relative mt-4 flex-none rounded-full bg-gray-50 size-8"
            />
            <div className="bh-white flex-auto rounded-md p-4 ring-1 ring-inset ring-gray-200">
              <div className="flex justify-between gap-x-4">
                <Link
                  target="_blank"
                  href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                  className="py-0.5 text-xs leading-5 text-gray-500"
                >
                  <span className="font-medium text-gray-900">
                    {commit.commitAuthorName}
                  </span>{" "}
                  <span className="inline-flex items-center">
                    commited
                    <ExternalLink className="ml-1 size-4" />
                  </span>
                </Link>
              </div>
              <span className="font-semibold">
              {commit.commitMessage}
            </span>
            <pre className=" mt-2 whitespace-pre-wrap text-gray-500 text-sm leading-6">
              {commit.summary}
            </pre>
            </div>
            
          </>
        </li>
      ))}
    </ul>
  );
}

export default CommitLog;

"use client";
import useProject from "@/hooks/use-Project";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import useRefetch from "@/hooks/use-refetch";
import { toast } from "sonner";
import InviteButton from "./invite-button";

function page() {
  const { project } = useProject();
  const archieve = api.project.archieveProject.useMutation();
  const refetch = useRefetch();
  const members = api.project.getTeamMembers.useQuery({
    projectId: project?.id!})
  return (
    <div className="">
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        <div className="flex w-fit items-center rounded-md bg-primary px-4 py-3">
          <Github className="sixe-3 text-white"></Github>
          <div className="ml-1">
            <p className="text-sm font-medium text-white">
              This project is linked to{" "}
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
        <div className="flex gap-4">
          <div className="flex items-center gap-2 ">
           {members.data?.map((member) => (
                <img
                  src={member.user.imageUrl || ""}
                  alt="user avatar"
                  className="size-8 rounded-full"
                />
            ))}
          </div>
          <InviteButton />
          <Button
            variant={"destructive"}
            disabled={archieve.isPending}
            size="sm"
            onClick={() => {
              archieve.mutate(
                { projectId: project?.id! },
                {
                  onSuccess: () => {
                    toast.success("Project archived successfully");
                    refetch();
                  },
                  onError: () => {
                    toast.error("Failed to archieve project");
                  },
                },
              );
            }}
          >
            Archieve
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard />
          <MeetingCard />
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4">
        <CommitLog />
      </div>
    </div>
  );
}

export default page;

"use client";
import React from "react";
import MeetingCard from "../dashboard/meeting-card";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-Project";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useRefetch from "@/hooks/use-refetch";
import { toast } from "sonner";

type Props = {};

function Meetings({}: Props) {
  const { project } = useProject();
  const meetings = api.project.getMeetings.useQuery(
    {
      projectId: project?.id!,
    },
    {
      refetchInterval: 4000,
    },
  );

  const refetch = useRefetch();

  const deleteMeeting = api.project.deleteMeeting.useMutation();
  return (
    <div>
      <MeetingCard />
      <div className="h-4"></div>
      <div>
        <h1 className="text-2xl font-semibold">Meetings</h1>
        {meetings.isLoading && <p className="">Loading...</p>}
        <ul className="divide-y divide-gray-200">
          {meetings.data?.map((meeting) => (
            <li
              key={meeting.id}
              className="flex items-center justify-between gap-6 py-5"
            >
              <div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/meetings/${meeting.id}`}
                      className="text-sm font-semibold"
                    >
                      {meeting.name}
                    </Link>
                    {meeting.status === "PROCESSING" && (
                      <Badge className="text-animate animate-pulse bg-yellow-500 text-white">
                        <p className="text-white">Processing...</p>
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-x-2 text-xs text-gray-500">
                    <p className="whitespace-nowrap">
                      {meeting.createdAt.toLocaleDateString()}
                    </p>
                    <p className="truncate">{meeting.Issue.length} issues</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-none items-center gap-x-4">
                <Link href={`/meetings/${meeting.id}`} className="text-primary">
                  <Button variant={"outline"} size={"sm"} disabled={meeting.status === "PROCESSING"}>
                    View Meeting
                  </Button>
                </Link>
                <Button
                  disabled={deleteMeeting.isPending || meeting.status === "PROCESSING"}
                  variant={"destructive"}
                  className=""
                  size={"sm"}
                  onClick={() =>
                    deleteMeeting.mutate(
                      { meetingId: meeting.id },
                      {
                        onSuccess: () => {
                          toast.success("Meeting deleted successfully");
                          refetch();
                        },
                      },
                    )
                  }
                >
                  Delete Meeting
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Meetings;

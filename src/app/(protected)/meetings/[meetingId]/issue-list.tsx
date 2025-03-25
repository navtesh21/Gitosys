"use client";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { VideoIcon } from "lucide-react";
import React from "react";

type Props = {
  meetingId: string;
};

function IssueList({ meetingId }: Props) {
  const { data, isLoading } = api.project.getMeetingById.useQuery(
    { meetingId },
    {
      refetchInterval: 4000,
    },
  );
  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <>
      <div className="p-8">
        <div className="lg-mx-0 lg-max-w-none  flex w-full items-center justify-start gap-x-8 border-b pb-6">
          <div className="flex items-center gap-x-6">
            <div className="rounded-full border bg-white p-3">
              <VideoIcon className="h-8 w-8" />
            </div>
            <h1>
              <div className="text-sm leading-6 text-gray-600">
                Meeting on {data.createdAt.toLocaleDateString()}
              </div>
              <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
                {data.name}
              </div>
            </h1>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {data.Issue.map((issue) => (
            <IssueCard issue={issue} key={issue.id} />
          ))}
        </div>
      </div>
    </>
  );
}

function IssueCard({ issue }: { issue: any }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{issue.gist}</DialogTitle>
            <DialogDescription>
              Created on: {new Date(issue?.createdAt).toLocaleDateString()}
            </DialogDescription>

            <p className="text-gray-600">{issue.headline}</p>
            <blockquote className="mt-2 border-l-4 border-gray-300 bg-gray-50 p-4">
              <span className="text-sm text-gray-600">
                {issue.start} - {issue.end}
              </span>
              <p className="font-medium italic leading-relaxed text-gray-900">
                {issue.summary}
              </p>
            </blockquote>

            <div className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Card className="relative w-full">
        <CardHeader>
          <CardTitle className="text-xl">{issue.gist}</CardTitle>
          <CardDescription>{issue.headline}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsOpen(true)}>Details</Button>
        </CardContent>
      </Card>
    </>
  );
}

export default IssueList;

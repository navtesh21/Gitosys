"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/use-Project";
import React from "react";
import { toast } from "sonner";

type Props = {};

function InviteButton({}: Props) {
  const { project } = useProject();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Invite members to your project by sharing this link:
            </p>
            <div className="flex items-center justify-between rounded-md border p-2">
              <Input
                readOnly
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/invite/${project?.id}`,
                  );
                  toast.success("Link copied to clipboard");
                }}
                value={`${window.location.origin}/invite/${project?.id}`}
                className="w-full cursor-pointer bg-transparent outline-none"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Button variant={"outline"} size="sm" onClick={() => setOpen(true)}>
        Invite Members
      </Button>
    </>
  );
}

export default InviteButton;

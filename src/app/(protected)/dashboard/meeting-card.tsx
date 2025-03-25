"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Presentation, Upload } from "lucide-react";
import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { uploadMP3 } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-Project";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type Props = {};

function MeetingCard({}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const upLoadMeeting = api.project.uploadMeeting.useMutation()
  const {project} = useProject()
  const router = useRouter()

  const mutation = useMutation({
    onMutate: async (meeting: any) => {
      const res = await axios.post("/api/process-meeting",{
        meetingId: meeting.meetingId,
        meetingUrl: meeting.meetingUrl,
        projectId: meeting.projectId,
      })

      return res.data
    },
  })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    console.log(file);
    console.log(project?.id);
    if (!file) return;
    if(!project?.id) return;

    setIsUploading(true);
    try {
      const data = await uploadMP3(file, setProgress);
      upLoadMeeting.mutate({
        meetingUrl: data?.url,
        projectId: project?.id,
        name: file.name,
      },{
        onSuccess:(meeting)=>{
          toast.success(`File uploaded successfully!`);
          router.push(`/meetings`)
          mutation.mutate({
            meetingId:meeting.id,
            meetingUrl: data.url,
            projectId: project.id
          })
        },
        onError:(error)=>{
          toast.error(`Upload failed!`);
          console.error("Upload failed:", error);
        } 
      })
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(`Upload failed!`);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/mpeg": [".mp3"] },
    multiple: false,
  });

  return (
    <div className="relative col-span-2" {...getRootProps()}>
        <input {...getInputProps()} />
      <Card>
        <div className="flex h-full flex-col items-center justify-between space-y-3 p-10">
          <CardTitle>
            <Presentation className="h-10 w-10 animate-bounce" />
          </CardTitle>
          <h1 className="mt-2 text-sm font-semibold text-gray-900">
            Create a new Meeting
          </h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse your meetings with Gitosys
            <br />
            Powered By AI
          </p>

          <div >
            
            {isDragActive ? (
              <p className="text-sm text-gray-700">
                Drop your MP3 file here...
              </p>
            ) : (
              <Button className="bg-primary text-white" disabled={isUploading}>
                <Upload className="h-5 w-5" />{" "}
                {isUploading ? `Uploading... ${progress}% `: "Upload Meeting"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default MeetingCard;

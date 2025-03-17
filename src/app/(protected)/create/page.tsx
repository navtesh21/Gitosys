"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {};

function CreatePage({}: Props) {
  const { register, handleSubmit ,reset} = useForm();
  const refetch = useRefetch()
  const createProject = api.project.createProject.useMutation();
  const formSubmit = (data: any) => {
    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          refetch()
          reset()
        },
        onError: () => {
          toast.error("Failed to create project");
        },
      },
    );
  };
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex gap-7">
        <Image src="/6502423.jpg" width={300} height={300} alt="github svg" />

        <div>
          <div>
            <h1 className="text-2xl font-semibold">
              Link Your Github Repository
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the URL of your repository to link it to the Gitosys
            </p>
          </div>
          <div className="h-4"></div>
          <form className="space-y-4" onSubmit={handleSubmit(formSubmit)}>
            <Input
              placeholder="Project Name"
              {...register("projectName", { required: true })}
              required
            />
            <div className="h-2"></div>
            <Input
              placeholder="Github URL"
              {...register("repoUrl", { required: true })}
              type="url"
              required
            />
            <div className="h-2"></div>
            <Input
              placeholder="Github Token (Optional)"
              {...register("token")}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={createProject.isPending}>Create Project</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePage;

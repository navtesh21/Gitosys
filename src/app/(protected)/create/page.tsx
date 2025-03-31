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
  const formSubmit = async (data: any) => {
    try {
      // Wait for project creation to complete
      const createdProject = await createProject.mutateAsync({
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      });
  
      toast.success("Project created successfully");
      refetch();
      reset();
    } catch (error) {
      console.log("Failed to create project", error);
      toast.error("Failed to create project,Github api rate limit exceeded");
      reset();
    }
  };
  
  
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-6 md:flex-row md:gap-10 px-4">
  <Image
    src="/6502423.jpg"
    width={250}
    height={250}
    alt="github svg"
    className="w-50 h-50 md:w-60 md:h-60 mr-6"
  />

  <div className="w-full max-w-md">
    <div>
      <h1 className="text-xl md:text-2xl font-semibold text-center md:text-left">
        Link Your Github Repository
      </h1>
      <p className="text-sm text-muted-foreground text-center md:text-left">
        Enter the URL of your repository to link it to the Gitosys
      </p>
    </div>
    <div className="h-4"></div>
    <form className="space-y-4" onSubmit={handleSubmit(formSubmit)}>
      <Input
        placeholder="Project Name"
        {...register("projectName", { required: true })}
        required
        className="w-full"
      />
      <div className="h-2"></div>
      <Input
        placeholder="Github URL"
        {...register("repoUrl", { required: true })}
        type="url"
        required
        className="w-full"
      />
      <div className="h-2"></div>
      <Input
        placeholder="Github Token (Optional)"
        {...register("token")}
        className="w-full"
      />
      <div className="h-4"></div>
      <Button
        type="submit"
        disabled={createProject.isPending}
        className="w-full"
      >
        Create Project
      </Button>
    </form>
  </div>
</div>
  );
}

export default CreatePage;

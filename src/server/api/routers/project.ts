import { get } from "http";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await ctx.db.project.create({
          data: {
            name: input.name,
            githubUrl: input.githubUrl,
            UserToProject: {
              create: {
                userId: ctx.user.userId!,
              },
            },
          },
        });

        await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
        const commit = await pollCommits(project.id);
        return project;
      } catch (error) {
        console.error("Error creating project", error);
        throw new Error("Error creating project");
      }
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: {
        UserToProject: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });

    return projects;
  }),
  getProjectCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      pollCommits(input.projectId);
      const commits = await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
      });
      return commits;
    }),
});

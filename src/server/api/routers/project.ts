import { get } from "http";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { Save, User } from "lucide-react";

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
    SaveQuestion: protectedProcedure.input(
      z.object({
        question: z.string(),
        answer: z.string(),
        projectId: z.string(),
        refrences: z.any(),
      })).mutation(async ({ ctx, input }) => {
        const question = await ctx.db.savedQuestions.create({
          data: {
            question: input.question,
            answer: input.answer,
            projectId: input.projectId,
            codeRefrences: input.refrences,
            userId: ctx.user.userId!,
          },
        });
        return question;
      }),
      getSavedQuestions: protectedProcedure.input(z.object({
        projectId: z.string(),
      })).query(async ({ ctx, input }) => {
        const questions = await ctx.db.savedQuestions.findMany({
          where: {
            projectId: input.projectId,

          },
          include:{
            user:true
          }
        });
        return questions;
      }),
      uploadMeeting:protectedProcedure.input(z.object({
        projectId:z.string(),
        meetingUrl:z.string(),
        name:z.string()
      })).mutation(async ({ctx,input})=>{
        const meeting = await ctx.db.meeting.create({
          data:{
            projectId:input.projectId,
            name:input.name,
            meetingUrl:input.meetingUrl,
            status:"PROCESSING"
          }
        });
        return meeting;
      }
    ),
    getMeetings:protectedProcedure.input(z.object({
      projectId:z.string()
    })).query(async ({ctx,input})=>{
      const meetings = await ctx.db.meeting.findMany({
        where:{
          projectId:input.projectId
        },include:{
          Issue:true
        }
      });
      return meetings;
    }),
    deleteMeeting:protectedProcedure.input(z.object({
      meetingId:z.string()
    })).mutation(async ({ctx,input})=>{
      const meeting = await ctx.db.meeting.delete({
        where:{
          id:input.meetingId
        }
      });
      return meeting;
    }),
    getMeetingById:protectedProcedure.input(z.object({
      meetingId:z.string()
    })).query(async ({ctx,input})=>{
      const meeting = await ctx.db.meeting.findUnique({
        where:{
          id:input.meetingId
        },
        include:{
          Issue:true
        }
      }
    );
      return meeting;
    }),
});

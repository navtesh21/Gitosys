import { db } from "@/server/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ projectId: string }>;
};

async function page({ params }: Props) {
  const { projectId } = await params;
  if (!projectId) {
    return redirect("/dashboard");
  }

  const user = await currentUser();
  if (!user) {
    return redirect("/sign-in");
  }

  let dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        email: user?.emailAddresses[0]?.emailAddress!,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        id: user.id,
      },
    });
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
   return redirect("/dashboard");
    
  }

  const existingEntry = await db.userToProject.findFirst({
    where: {
      projectId: project.id,
      userId: user.id,
    },
  });

  if (!existingEntry) {
    try {
      await db.userToProject.create({
        data: {
          projectId: project.id,
          userId: user.id,
        },
      });
    } catch (error) {
      console.error("Failed to add user to project:", error);
    }
  }

  return redirect("/dashboard");
}

export default page;

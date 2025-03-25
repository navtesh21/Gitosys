import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";
import z, { string } from "zod";

const bodyParser = z.object({
  meetingId: z.string(),
  projectId: z.string(),
  meetingUrl: z.string(),
});

export const maxDuration = 300 //5 minutes

export const POST = async (params: NextRequest) => {
  const body = await params.json();
  const { meetingId, projectId, meetingUrl } = bodyParser.parse(body);
  console.log(meetingId, projectId, meetingUrl);

  const summaries = await processMeeting(meetingUrl);
  console.log(summaries);
  await db.issue.createMany({
    data: summaries.map((summary) => ({
      meetingId,
      ...summary,
  }))
    });

    await db.meeting.update({
      where: {
        id: meetingId,
      },    
        data: {
            status:"COMPLETED",
            name:summaries[0]?.headline,
        },
    });


  return NextResponse.json({
    summaries,
  });
};

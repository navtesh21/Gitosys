"use client";
import React, { useState } from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useProject from "@/hooks/use-Project";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import MDEditor from "@uiw/react-md-editor";
import { Code } from "lucide-react";
import CodeReferences from "../dashboard/CodeRefrences";

type Props = {};

function page({}: Props) {
  const { projectId } = useProject();
  const getQuestions = api.project.getSavedQuestions.useQuery({ projectId });
  const [questionId, setQuestionId] = useState<number | null>(null);
  const question = getQuestions.data?.[questionId!]
  return (
    <div className="space-y-4">
      <Sheet>
        <div className="grid w-full grid-cols-1">
          <AskQuestionCard />
        </div>
        <div className="mt-8 flex flex-col gap-4">
          <h1 className="text-xl font-semibold">Saved Questions</h1>
          {getQuestions.data?.map((question,index) => (
           <Card key={question.id}>
           <SheetTrigger className="p-3" onClick={() => setQuestionId(index)}>
             <CardHeader className="flex items-center gap-4">
               {/* Profile Image */}
               <div className="flex items-center gap-4">
                 <Image
                   src={question.user.imageUrl || ""} // Use a valid default image
                   alt="Profile image"
                   height={40}
                   width={40}
                   className="rounded-full object-cover"
                 />
         
               {/* Text Content */}
               <div className="flex flex-col  text-left">
                <div className="flex items-center gap-2">
                 <p className=" text-gray-700 text-lg font-medium line-clamp-1">{question.question}</p>
                 <span className="text-xs whitespace-nowrap text-gray-400">{question.createdAt.toLocaleDateString()}</span>
               </div>

                 <p className="text-sm text-gray-500 line-clamp-2">
                   {question.answer}
                 </p>
                 </div>
               </div>
             </CardHeader>
           </SheetTrigger>
         </Card>
          ))}
        </div>
        {question && <SheetContent className=" h-full overflow-scroll sm:max-w-[80vw] w-[70vw]">
        <SheetHeader>
          <SheetTitle>{question.question}</SheetTitle>
          <SheetDescription>
          <MDEditor.Markdown
            source={question.answer}
            className="h-full  w-full overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-4"
          />  
          <div className="h-4"></div>
          <CodeReferences files={JSON.parse(question.codeRefrences)} />

          </SheetDescription>
        </SheetHeader>
      
      </SheetContent>}
      </Sheet>
      
    </div>
  );
}

export default page;

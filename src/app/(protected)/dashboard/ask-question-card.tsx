import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-Project";
import { askQuestion } from "@/lib/chatAi";
import Image from "next/image";
import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import CodeRefrences from "./CodeRefrences";
import { api } from "@/trpc/react";
import useRefetch from "@/hooks/use-refetch";

type Props = {};

function AskQuestionCard({}: Props) {
  const { project } = useProject();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [output, setOutput] = useState("");
  const [fileRefreneces, setFileRefreneces] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([{ fileName: "", sourceCode: "", summary: "" }]);
  const [loading, setLoading] = useState(false);
  const saveAnswer = api.project.SaveQuestion.useMutation();
  const refetch = useRefetch();
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-scroll sm:max-w-[80vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Image src="/Keren_7.jpg" alt="logo" width={40} height={40} />3
            
              <Button
                type="button"
                disabled={saveAnswer.isPending || saveAnswer.isSuccess}
                onClick={() => {
                  saveAnswer.mutate({
                    question,
                    answer: output,
                    refrences: JSON.stringify(fileRefreneces),
                    projectId: project?.id!,
                  });
                  refetch();

                }}
              >
                {saveAnswer.isSuccess ? "Saved" : "Save Answer"}
              </Button>
            </DialogTitle>
          </DialogHeader>

          <MDEditor.Markdown
            source={output}
            className="h-full max-h-[40vh] w-full overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-4"
          />
          <div className="h-4"></div>
          <Button
            type="button"
            onClick={() => {
              setOpen(false);
              setOutput("");
              setQuestion("");
            }}
          >
            Close
          </Button>
          <CodeRefrences files={fileRefreneces} />
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
          <CardDescription>
             Get answer from Gitosys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              setOutput("");
              setFileRefreneces([]);
              if (!project?.id) return;
              e.preventDefault();
              setLoading(true);
              const { text, result } = await askQuestion(question, project.id);
              setOutput(text);
              setFileRefreneces(result);
              setOpen(true);
              setLoading(false);
            }}
          >
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask Gitosys!
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default AskQuestionCard;

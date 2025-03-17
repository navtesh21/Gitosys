import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { set } from "date-fns";
import CodeRefrences from "./CodeRefrences";

type Props = {};

function AskQuestionCard({}: Props) {
  const { project } = useProject();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [output, setOutput] = useState("");
  const [fileRefreneces, setFileRefreneces] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([{ fileName: "", sourceCode: "", summary: "" }]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw] overflow-scroll max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              <Image src="/Keren_7.jpg" alt="logo" width={40} height={40} />
            </DialogTitle>
          </DialogHeader>

          <MDEditor.Markdown
            source={output}
            className="h-full max-h-[40vh] w-full overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-4"
          />
          <div className="h-4"></div>
          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
          <CodeRefrences files={fileRefreneces} />
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              setOutput("");
              setFileRefreneces([]);
              if (!project?.id) return;
              e.preventDefault();
              const { text, result } = await askQuestion(question, project.id);
              setOutput(text);
              setFileRefreneces(result);
              setOpen(true);
            }}
          >
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit">Ask Gitosys!</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default AskQuestionCard;

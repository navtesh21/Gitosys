import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FileData {
  fileName: string;
  sourceCode: string;
  summary: string;
}

type Props = {
  files: FileData[];
};

const CodeReferences: React.FC<Props> = ({ files }) => {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col w-full h-full">
      <Tabs defaultValue={files[0]?.fileName} className="w-full h-full">
        <TabsList className="flex justify-start border-b border-gray-300 dark:border-gray-700">
          {files.map((file) => (
            <TabsTrigger key={file.fileName} value={file.fileName}>
              {file.fileName}
            </TabsTrigger>
          ))}
        </TabsList>
        {files.map((file) => (
          <TabsContent key={file.fileName} value={file.fileName} className="p-4 overflow-scroll max-h-[50vh] w-full">
            <SyntaxHighlighter language="typescript" style={oneDark} className="rounded-md flex-wrap w-full">
              {file.sourceCode}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeReferences;

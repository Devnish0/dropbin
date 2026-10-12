"use client";
import TextInput from "@/components/text_input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CloudFogIcon,
  Paperclip,
  Settings2Icon,
  Terminal,
  User2Icon,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  return (
    <main className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 flex flex-col">
      <header className="flex items-center justify-between pb-8 border-b border-border">
        <div className="flex justify-center items-center gap-4">
          <span className="w-4-h-4 bg-background">
            <CloudFogIcon />
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Dropbin
          </h1>
        </div>
        {/* <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full  text-accent-foreground"> */}
        <span className="p-2 rounded-full text-neutral-300 bg-primary ">
          <User2Icon />
          {/* </span> */}
        </span>
      </header>

      <div className="mt-8">
        <h2 className="text-5xl font-serif text-primary">
          Drop text, images, or files
        </h2>
        <p className="mt-1 text-sm text-secondary">
          Store with an optional custom code and share with an automatic
          expiration.
        </p>
      </div>
      <main className="w-full h-300 bg-neutral-100 mt-3 p-4 rounded-xl">
        <div>
          {/* shadcn tabs components */}
          <Tabs defaultValue="text" className=" w-full flex flex-col">
            <TabsList className="bg-[#e0e4dd] dark:bg-surface/60 p-1 rounded-2xl h-auto border border-border/60 inline-flex">
              <TabsTrigger
                value="text"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-xl py-2 px-4 flex items-center gap-2 text-sm font-
  medium transition-all"
              >
                <Terminal className="w-4 h-4 stroke-[2.2]" />
                Text / Secret Note
              </TabsTrigger>

              <TabsTrigger
                value="file"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-xl py-2 px-4 flex items-center gap-2 text-sm font-
  medium transition-all"
              >
                <Paperclip className="w-4 h-4 stroke-[2.2]" />
                Files / Media
              </TabsTrigger>
            </TabsList>

            {/* 1. Text Paste Area */}
            <TabsContent value="text" className="mt-3">
              <TextInput value={text} onChange={setText} />
            </TabsContent>

            {/* 2. File Drag & Drop Zone */}
            <TabsContent value="file" className="mt-6">
              <div className="p-12 rounded-2xl border-2 border-dashed border-border bg-card/50 text-center">
                {/* Your drag and drop dropzone will go here */}
                <p className="text-secondary text-sm">
                  Drag & drop files or images here, or browse...
                </p>
              </div>
            </TabsContent>
          </Tabs>
          <div className="w-full bg-neutral-200 rounded-2xl p-4 mt-4">
            <Settings2Icon size={14} /> Settings
          </div>
        </div>
      </main>
    </main>
  );
}

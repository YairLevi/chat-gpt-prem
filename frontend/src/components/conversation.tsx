import { Response } from "@/components/response";
import { Prompt } from "@/components/prompt";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, SendHorizonal } from "lucide-react";
import { useEffect, useRef } from "react";
import { useOpenAiChatApi } from "@/api/chat/openai";
import { useSpeechRecognition } from "@/api/speech/deepgram";


export function Conversation() {
  const { messages, ask, isLoading } = useOpenAiChatApi()
  const inputRef = useRef<HTMLInputElement>(null)
  const {toggle, ready, listening} = useSpeechRecognition((transcript) => {
    if (!inputRef.current) return
    inputRef.current.value += transcript + " "
  })

  function onSend() {
    const value = inputRef.current.value
    inputRef.current.value = ''
    ask(value)
  }

  const divRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    divRef.current.scrollTop = divRef.current.scrollHeight
  }, [messages]);

  return (
    <div className="h-full w-8/12 bg-accent flex flex-col" ref={divRef}>
      <div className="h-full overflow-auto py-3">
        {
          messages.map(msg => (
            msg.role == 'user'
              ? <Prompt content={msg.content}/>
              : <Response content={msg.content}/>
          ))
        }
        {
          isLoading &&
            <Response content="Loading..."/>
        }
      </div>
      <div className="bg-gradient-to-t from-accent via-accent via-60% to-transparent w-full p-5 flex gap-3">
        <Input className="drop-shadow-xl text-md" type="textarea" ref={inputRef}/>
        <Button onClick={onSend} variant="outline">
          <SendHorizonal size={20}/>
        </Button>
        <Button onClick={toggle} variant="outline" disabled={!ready}>
          {listening ? <MicOff size={20} /> : <Mic size={20}/>}
        </Button>
      </div>
    </div>
  )
}
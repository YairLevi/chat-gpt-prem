import { Response } from "@/components/response";
import { Prompt } from "@/components/prompt";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useOpenAIChatApi } from "@/api/chat/openai";
import { useSpeechRecognition } from "@/api/stt/deepgram";
import { useKeybind } from "@/hooks/useKeybind";
import { useChat } from "@/contexts/chat";


export function Conversation() {
  const { currentChat, askQuestion } = useChat()

  // const { messages, ask, isLoading } = useOpenAIChatApi()
  const [isLoading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const {toggle, ready, listening} = useSpeechRecognition((transcript) => {
    if (!inputRef.current) return
    inputRef.current.value += transcript + " "
  })

  async function onSend() {
    const value = inputRef.current.value
    inputRef.current.value = ''
    setLoading(true)
    await askQuestion(value)
    setLoading(false)
  }

  useKeybind(() => onSend(), [], ["Enter"])


  return currentChat?.messages && (
    <div className="h-full w-full bg-accent flex flex-col px-10">
      <div className="h-full overflow-auto py-3">
        {
          currentChat.messages.length == 0
          && <p>There are no messages in this chat</p>
        }
        {
          currentChat.messages.map(msg => (
            msg.role == 'user'
              ? <Prompt content={msg.content}/>
              : <Response content={msg.content}/>
          ))
        }
        {
          isLoading &&
            <p>Loading...</p>
        }
      </div>
      <div className="bg-gradient-to-t from-accent via-accent via-60% to-transparent w-full py-5 flex gap-3">
        <Input className="text-md" type="textarea" ref={inputRef}/>
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
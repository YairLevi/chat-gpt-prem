import { Response } from "@/components/response";
import { Prompt } from "@/components/prompt";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, SendHorizonal } from "lucide-react";
import { useRef, useState } from "react";
import { useSpeechRecognition } from "@/api/stt/deepgram";
import { useKeybind } from "@/hooks/useKeybind";
import { useChat } from "@/contexts/chat";


export function Conversation() {
  const { currentChat, askQuestion } = useChat()

  // const { messages, ask, isLoading } = useOpenAIChatApi()
  const [isLoading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toggle, ready, listening } = useSpeechRecognition((transcript) => {
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

  useKeybind(() => onSend(), [currentChat], ["Enter"])


  if (!currentChat?.messages) {
    return (
      <div className="text-center">
        <h4 className="text-xl font-medium text-muted-foreground">Let's talk!</h4>
        <p className="text-muted-foreground">Pick a chat or create a new one, and ask me anything</p>
      </div>
    )
  }

  return currentChat?.messages && (
    <div className="h-full w-full bg-background flex flex-col px-10">
      <div className="h-full overflow-auto py-3 flex flex-col">
        {
          currentChat.messages.length == 0
          && <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">There are no messages in this chat</p>
          </div>
        }
        {
          currentChat.messages.map(msg => (
            msg.role == 'user'
              ? <Prompt content={msg.content}/>
              : <Response content={msg.content}/>
          ))
        }
      </div>
      <div className="w-full py-5 flex flex-col gap-2">
        {
          isLoading &&
            <p className="text-gray-600 w-full text-center pb-2 bg-accent">Loading Reply...</p>

        }
        <div className="flex gap-3">
          <Input className="text-md" type="textarea" ref={inputRef}/>
          <Button onClick={onSend} variant="outline">
            <SendHorizonal size={20}/>
          </Button>
          <Button onClick={toggle} variant="outline" disabled={!ready}>
            {listening ? <MicOff size={20}/> : <Mic size={20}/>}
          </Button>
        </div>
      </div>
    </div>
  )
}
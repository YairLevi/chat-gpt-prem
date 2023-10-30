import { useState } from "react";
import { Ask } from "@/../wailsjs/go/chat/OpenAIService";
import { chat } from '@/../wailsjs/go/models'

type ChatMessage = {
  role: "assistant" | "user"
  content: string
}

export function useOpenAIChatApi() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setLoading] = useState(false)

  async function ask(question: string) {
    const history = messages.map(msg => {
      const backendMsg = new chat.Message()
      backendMsg.content = msg.content
      backendMsg.role = msg.role
      return backendMsg
    })

    setMessages(prev => [...prev, {
      role: "user",
      content: question,
    }])

    setLoading(true)
    // const response = await Ask(history, question)
    setLoading(false)

    // setMessages(prev => [...prev, {
    //   role: "assistant",
    //   content: response
    // }])
  }

  return {
    messages,
    isLoading,
    ask
  }
}
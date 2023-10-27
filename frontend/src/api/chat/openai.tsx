import OpenAI from "openai";
import { useEffect, useState } from "react";
import { Ask } from "../../../wailsjs/go/openai/ChatController";
type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessage


// const openai = new OpenAI({
//   apiKey: "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",
//   dangerouslyAllowBrowser: true,
// });

export function useOpenAiChatApi() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setLoading] = useState(false)

  async function ask(question: string) {
    setMessages(prev => [...prev, {
      role: "user",
      content: question,
    }])
    setLoading(true)
    const response = await Ask(question)
    setLoading(false)
    setMessages(prev => [...prev, {
      role: "assistant",
      content: response
    }])
  }

  return {
    messages,
    isLoading,
    ask
  }
}
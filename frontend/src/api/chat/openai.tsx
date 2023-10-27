import OpenAI from "openai";
import { useEffect, useState } from "react";
type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessage


const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});

export function useOpenAiChatApi() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    (async function () {
      const lastSender = messages.at(-1).role
      if (lastSender != "user") {
        return
      }

      setLoading(true)
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 1024,
        messages: messages
      })

      setLoading(false)
      setMessages(prev => [...prev, completion.choices[0].message])
    })()
  }, [messages])

  async function ask(question: string) {
    const msg: ChatMessage = {
      role: 'user',
      content: question
    }

    setMessages(prev => [...prev, msg])
  }

  return {
    messages,
    isLoading,
    ask
  }
}
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { chat } from "../../wailsjs/go/models";
import Chat = chat.Chat;
import * as chatService from "../../wailsjs/go/services/ChatService";
import { useAsync } from "@/hooks/useEffectAsync";
import {
  AddMessage,
  DeleteChat,
  GetChatsWithoutMessages,
  GetChatWithMessages
} from "../../wailsjs/go/services/ChatService";
import { Ask } from "../../wailsjs/go/chat/OpenAIService";

type ChatExports = {
  currentChat: Chat
  chats: Chat[]
  createChat: (title: string) => Promise<void>
  deleteChat: (chatID: number) => Promise<void>
  changeChat: (chat: Chat) => Promise<void>
  askQuestion: (question: string) => Promise<void>
}

const ChatContext = createContext<ChatExports>({} as ChatExports)

export function useChat() {
  return useContext(ChatContext)
}

export function ChatProvider({ children }: PropsWithChildren) {
  const [currentChat, setCurrentChat] = useState<Chat>()
  const [chats, setChats] = useState<Chat[]>([])

  useAsync(async () => {
    const chats = await GetChatsWithoutMessages()
    setChats(chats)
  }, [])

  async function createChat(title: string) {
    const chat = await chatService.New(title)
    setCurrentChat(chat)
    setChats(prev => [chat, ...prev])
  }

  async function changeChat(chat: Chat) {
    const chatWithMessages = await GetChatWithMessages(chat.id)
    setCurrentChat(chatWithMessages)
  }

  function copyClass<T>(classType: { new (): T }, instance: T): T {
    const nt = new classType();
    for (const key of Object.keys(instance)) {
      nt[key] = instance[key];
    }
    return nt;
  }

  async function addMessageToCurrentChat(role: "user" | "assistant", content: string): Promise<Chat> {
    const newChat = copyClass(Chat, currentChat)
    const message = new chat.Message()
    message.role = role
    message.content = content
    newChat.messages.push(message)

    setCurrentChat(newChat)
    const idx = chats.findIndex(chat => chat.id == currentChat.id)
    setChats(prev => {
      const newChats = [...prev]
      newChats[idx] = newChat
      return newChats
    })

    return newChat
  }

  async function askQuestion(question: string) {
    const newChat = await addMessageToCurrentChat("user", question)
    await AddMessage(currentChat.id, "user", question)
    const answer = await Ask(newChat.messages)
    await addMessageToCurrentChat("assistant", answer)
    await AddMessage(currentChat.id, "assistant", answer)
  }

  async function deleteChat(chatID: number) {
    await DeleteChat(chatID)
    setChats(prev => prev.filter(chat => chat.id != chatID))
    if (currentChat.id == chatID) {
      setCurrentChat(undefined)
    }
  }

  const value = {
    currentChat,
    createChat,
    changeChat,
    chats,
    askQuestion,
    deleteChat
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
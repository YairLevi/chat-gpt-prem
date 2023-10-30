import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";
import { useChat } from "@/contexts/chat";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { chat } from "../../wailsjs/go/models";
import Chat = chat.Chat;


type ChatTileProps = {
  chat: Chat
}

function ChatTile({ chat }: ChatTileProps) {
  const { changeChat, currentChat } = useChat()

  function click() {
    changeChat(chat)
  }

  return (
    <div
      className={cn(
        "flex gap-3 p-2 select-none rounded-md items-center",
        "hover:bg-gray-500 hover:bg-opacity-20 hover:cursor-pointer",
        currentChat && currentChat.id == chat.id && "bg-gray-300"
      )}
      onClick={click}>
      <MessageSquare size={20}/>
      <p>{chat.title}</p>
    </div>
  )
}

export function Sidebar() {
  const { chats, createChat } = useChat()
  const [open, setOpen] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  async function onCreate() {
    await createChat(titleRef.current.value)
    setOpen(false)
  }

  return (
    <div className="min-h-full w-80 flex flex-col gap-2 p-4 border-r overflow-auto">
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="mr-2 -ml-2" size={20}/> New Chat
      </Button>
      <hr className="border-b"/>
      {
        chats.map(chat => <ChatTile chat={chat}/>)
      }

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-lg !w-1/2 !min-w-[16rem]">
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
            <DialogDescription>
              Create a new chat with our bot.
            </DialogDescription>
          </DialogHeader>
          <span className="text-sm text-muted-foreground">Title:</span>
          <Input ref={titleRef}/>
          <DialogFooter>
            <Button variant="outline" onClick={onCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
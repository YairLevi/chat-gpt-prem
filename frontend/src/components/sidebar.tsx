import { Button } from "@/components/ui/button";
import { MessageSquare, Moon, Plus, Sun, Trash } from "lucide-react";
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
import { useTheme } from "@/contexts/theme";
import Chat = chat.Chat;


type ChatTileProps = {
  chat: Chat
}

function ChatTile({ chat }: ChatTileProps) {
  const { changeChat, currentChat, deleteChat } = useChat()

  function click() {
    changeChat(chat)
  }

  return (
    <div
      className={cn(
        "flex p-2 select-none rounded-md items-center justify-between mx-4",
        "hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-accent transition",
        "group relative",
        currentChat && currentChat.id == chat.id && "bg-accent"
      )}
      onClick={click}>
      <div className="flex gap-1 items-center">
        <MessageSquare size={20} className="text-gray-500 min-w-[2rem]"/>
        <p className="overflow-ellipsis line-clamp-1">{chat.title}</p>
      </div>

      <div className="invisible w-0 group-hover:visible group-hover:w-fit">
        <Trash size={40}
               className="rounded-md min-w-[2rem] max-w-[2rem] min-h-[2rem] max-h-[2rem] p-1.5 bg-accent hover:bg-background"
               onClick={() => deleteChat(chat.id)}/>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { chats, createChat } = useChat()
  const [open, setOpen] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const { setTheme, theme } = useTheme()


  async function onCreate() {
    await createChat(titleRef.current.value)
    setOpen(false)
  }

  return (
    <div className="min-h-full min-w-[17rem] max-w-[17rem] flex flex-col gap-2 border-r pb-4">
      <div className="flex gap-2 justify-around items-center p-4 pb-0">
        {
          theme == "dark"
            ? <Moon size={30}
                    className="rounded-md min-w-[2rem] max-w-[2rem] min-h-[2rem] max-h-[2rem] p-1 hover:bg-accent"
                    onClick={() => setTheme("light")}/>
            : <Sun size={30}
                   className="rounded-md min-w-[2rem] max-w-[2rem] min-h-[2rem] max-h-[2rem] p-1 hover:bg-accent"
                   onClick={() => setTheme("dark")}/>
        }
        <Button className="w-full" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="mr-2 -ml-2" size={20}/> New Chat
        </Button>
      </div>
      <hr className="border-b mx-4"/>
      <div className="gap-2 flex flex-col overflow-y-auto overflow-x-hidden">
      {
        chats.map(chat => <>
          <ChatTile chat={chat}/>
        </>)
      }
      </div>
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
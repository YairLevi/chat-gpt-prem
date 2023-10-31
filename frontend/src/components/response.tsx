import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import chatGptImage from '@/assets/chat-gpt.png'
import MarkdownPreview from "@uiw/react-markdown-preview";

type ResponseProps = {
  content: string
}

export function Response({ content }: ResponseProps) {
  return (
    <div className="pl-4 pr-12 py-4 flex gap-5">
      <Avatar>
        <AvatarImage src={chatGptImage}/>
        <AvatarFallback className="text-white bg-orange-500">YL</AvatarFallback>
      </Avatar>
      <MarkdownPreview
        className="bg-transparent !min-w-0 text-foreground"
        source={content}
      />
    </div>
  )
}
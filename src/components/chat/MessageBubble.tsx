import { cn } from "@/lib/utils";
import { Message } from "@/lib/types";
import { User, Bot } from "lucide-react";

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={cn(
            "flex w-full mb-6",
            isUser ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "flex max-w-[80%] md:max-w-[70%] items-end gap-2",
                isUser ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Avatar */}
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    isUser ? "bg-indigo-600" : "bg-emerald-600"
                )}>
                    {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                </div>

                {/* Bubble */}
                <div className={cn(
                    "p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed animate-in fade-in slide-in-from-bottom-2 selection:bg-black/20",
                    isUser
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                )}>
                    {message.content}
                </div>
            </div>
        </div>
    );
}

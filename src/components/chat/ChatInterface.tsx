'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageBubble } from './MessageBubble';
import { Send, StopCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function ChatInterface({ topicId }: { topicId: string }) {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [interviewId, setInterviewId] = useState<string | null>(null);
    const [input, setInput] = useState('');

    // Create interview session on mount
    useEffect(() => {
        const createSession = async () => {
            try {
                const res = await fetch('/api/interviews', {
                    method: 'POST',
                    body: JSON.stringify({ topicId })
                });
                const data = await res.json();
                if (data.id) {
                    setInterviewId(data.id);
                }
            } catch (e) {
                console.error("Failed to create session", e);
            }
        };
        createSession();
    }, [topicId]);

    const { messages, sendMessage, status, error, stop } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
            body: { topicId, interviewId },
        }),
        initialMessages: [{
            id: 'init-1',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Hello! Thank you for participating. I am ready to hear your thoughts. Shall we begin?' }],
        }],
        onFinish: () => {
            scrollToBottom();
        }
    });

    const isLoading = status === 'streaming' || status === 'submitted';

    // Debug logging
    console.log('Chat State:', { interviewId, isLoading, status, messagesLength: messages.length, error });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || status !== 'ready') return;

        sendMessage({ text: input });
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const handleFinish = () => {
        // Fallback: Save to local storage just in case
        localStorage.setItem('interview-messages', JSON.stringify(messages));

        // Pass info to report page
        if (interviewId) {
            router.push(`/report/${topicId}?interviewId=${interviewId}`);
        } else {
            router.push(`/report/${topicId}`);
        }
    };

    if (!interviewId) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-gray-400 gap-2">
                <Loader2 className="animate-spin" />
                <span>Initializing secure session...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto p-4">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
                {messages.map((msg) => {
                    // Extract text from parts
                    const textContent = msg.parts
                        .filter((part: any) => part.type === 'text')
                        .map((part: any) => part.text)
                        .join('');

                    return (
                        <MessageBubble
                            key={msg.id}
                            message={{
                                id: msg.id,
                                role: msg.role as 'user' | 'assistant',
                                content: textContent,
                                createdAt: new Date()
                            }}
                        />
                    );
                })}
                {isLoading && (
                    <div className="ml-12 text-xs text-gray-400 animate-pulse mb-4">
                        AI is typing...
                    </div>
                )}
                {error && (
                    <div className="mx-4 mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                        <StopCircle size={16} />
                        <span>Unable to connect to AI. Please check your API key.</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="mt-4 pt-4 border-t border-gray-100 bg-white">
                <form onSubmit={handleSubmit} className="relative flex items-end gap-2 p-2 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white shadow-sm">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your answer..."
                        disabled={status !== 'ready'}
                        className="w-full max-h-[150px] min-h-[50px] p-2 bg-transparent resize-none focus:outline-none text-base text-gray-800 placeholder:text-gray-400 disabled:opacity-50"
                        rows={1}
                    />
                    {isLoading ? (
                        <button
                            type="button"
                            onClick={() => stop()}
                            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all mb-1"
                        >
                            <StopCircle size={20} />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim() || status !== 'ready'}
                            className={cn(
                                "p-3 rounded-full transition-all duration-200 flex items-center justify-center mb-1",
                                input.trim() && status === 'ready'
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:scale-105"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            <Send size={20} />
                        </button>
                    )}
                </form>

                <div className="flex justify-center mt-4">
                    <button
                        onClick={handleFinish}
                        className="text-gray-400 hover:text-red-500 text-xs font-medium transition-colors flex items-center gap-1 py-2 px-4 rounded-full hover:bg-red-50"
                    >
                        End Interview Early
                    </button>
                </div>
            </div>
        </div>
    );
}

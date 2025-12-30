'use client';

import { useChat } from '@ai-sdk/react';
import { MessageBubble } from './MessageBubble';
import { Send, StopCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, FormEvent } from 'react';

// Define Message type locally or import. We import from lib/types but need to map.
// We'll trust the SDK's message structure for the hook, and map to UI.

export function ChatInterface({ topicId }: { topicId: string }) {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [interviewId, setInterviewId] = useState<string | null>(null);

    // Manual input state to bypass potential strict type issues
    const [localInput, setLocalInput] = useState('');

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

    // Cast to any to bypass strict type checks on the hook return
    const chatHelpers = useChat({
        api: '/api/chat',
        body: { topicId, interviewId },
        initialMessages: [{
            id: 'init-1',
            role: 'assistant',
            content: 'Hello! Thank you for participating. I am ready to hear your thoughts. Shall we begin?',
            createdAt: new Date(),
        }],
        onFinish: () => {
            scrollToBottom();
        }
    } as any) as any;

    const {
        messages,
        stop,
        append,
        isLoading: sdkLoading,
        error,
        status
    } = chatHelpers;

    // const isLoading = sdkLoading || status === 'streaming' || status === 'submitted';
    // Simplified loading check
    const isAiLoading = sdkLoading || status === 'streaming' || status === 'submitted';

    // Debug logging
    console.log('Chat State:', { interviewId, isAiLoading, status, messagesLength: messages.length, error });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: FormEvent) => {
        e?.preventDefault();
        if (!localInput.trim()) return;

        const content = localInput;
        setLocalInput('');

        await append({
            role: 'user',
            content: content
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
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
                {messages.map((msg: any) => (
                    <MessageBubble
                        key={msg.id}
                        message={{
                            id: msg.id,
                            role: msg.role as 'user' | 'assistant',
                            content: msg.content,
                            createdAt: msg.createdAt || new Date()
                        }}
                    />
                ))}
                {isAiLoading && (
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
                <form onSubmit={handleSend} className="relative flex items-end gap-2 p-2 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white shadow-sm">
                    <textarea
                        value={localInput}
                        onChange={(e) => setLocalInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your answer..."
                        className="w-full max-h-[150px] min-h-[50px] p-2 bg-transparent resize-none focus:outline-none text-base text-gray-800 placeholder:text-gray-400"
                        rows={1}
                    />
                    {isAiLoading ? (
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
                            disabled={!localInput.trim()}
                            className={cn(
                                "p-3 rounded-full transition-all duration-200 flex items-center justify-center mb-1",
                                localInput.trim()
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

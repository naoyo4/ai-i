'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { INTERVIEW_TOPICS } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use } from 'react';

// Next.js 15+ compatible params handling (async params)
// But create-next-app defaults might be 14 or 15.
// To be safe for 15 (which is latest), params is a Promise.
// But standard 14 is object. `use` hook can handle promises.
// I will assume standard prop pattern but wrapped in `use` or just await if it's async component.
// But this is 'use client', so it receives params as prop.
// Actually in Next.js 15, params in client components is a promise.
// In Next.js 14, it's a prop.
// A safe way is to wrap it or use `useParams` hook.
import { useParams } from 'next/navigation';

export default function InterviewPage() {
    const params = useParams();
    const id = params?.id as string;

    const topic = INTERVIEW_TOPICS.find(t => t.id === id);

    if (!topic) {
        // In a real app we might return notFound() or handle loading if params aren't ready
        // client-side notFound logic is tricky, usually we redirect.
        // For static list, if not found, render error.
        if (id) return <div className="p-8 text-center">Topic not found</div>;
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Interview</span>
                        <h1 className="font-semibold text-gray-800">{topic.title}</h1>
                    </div>
                    <div className="w-8" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Chat Area */}
            <ChatInterface topicId={id} />
        </div>
    );
}

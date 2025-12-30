import Link from 'next/link';
import { INTERVIEW_TOPICS } from '@/lib/types';
import { ArrowRight, Clock, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
// Map icon strings to components if needed, or import dynamically.
// For simplicity in this step, I'll allow dynamic imports or just simple icon mapping in component.
import * as Icons from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-4">
            AI-Powered Interviews
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
            Discover Insights with <br />
            <span className="text-indigo-600">AI Interviews</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Participate in structured conversations on various topics and get instant AI-generated summaries and insights.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INTERVIEW_TOPICS.map((topic) => {
            // dynamic icon rendering
            // @ts-ignore
            const IconComponent = Icons[topic.icon.charAt(0).toUpperCase() + topic.icon.slice(1)] || Icons.MessageSquare;
            // The plan had simple string icons, but Lucide components need to be mapped.
            // A safer way is used below or I fix types.
            // Fix: I will just instantiate specific icons in the type definition or map them here properly.
            // Mapping 'users' -> Users, 'mic' -> Mic, 'file-text' -> FileText
            // For now, let's use a helper map inside the map or switch.

            return (
              <Link
                key={topic.id}
                href={`/interview/${topic.id}`}
                className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-xl transition-transform group-hover:scale-110", topic.color)}>
                  {/* Using a rough map or specific icons based on ID for simplicity in this generated file */}
                  {topic.id === 'event-feedback' && <Icons.Mic size={24} />}
                  {topic.id === 'policy-hearing' && <Icons.FileText size={24} />}
                  {topic.id === 'user-interview' && <Icons.Users size={24} />}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.title}</h3>
                <p className="text-gray-500 mb-6 flex-grow">{topic.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-1">
                    <HelpCircle size={14} />
                    <span>{topic.questionsCount} Qs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{topic.durationMinutes} min</span>
                  </div>
                </div>

                <div className="flex items-center font-medium text-indigo-600 group-hover:gap-2 transition-all">
                  Start Interview
                  <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Loader2, LayoutDashboard, FileText, Calendar } from 'lucide-react';
import { INTERVIEW_TOPICS } from '@/lib/types';

// Define type for interview record
type Interview = {
    id: string;
    created_at: string;
    topic_id: string;
    status: string;
    report: any;
};

export default function AdminPage() {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            if (!supabase) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('interviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching interviews:', error);
            } else {
                setInterviews(data || []);
            }
            setLoading(false);
        };

        fetchInterviews();
    }, []);

    const getTopicTitle = (id: string) => {
        return INTERVIEW_TOPICS.find(t => t.id === id)?.title || id;
    };

    if (!supabase) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-2">
                    <p className="font-bold text-red-500">Supabase Not Configured</p>
                    <p className="text-gray-500 text-sm">Please add environment variables to view the dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md">
                            <LayoutDashboard size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                    <Link href="/" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                        Back to Home
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800">Interview History</h2>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{interviews.length} Records</span>
                    </div>

                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="animate-spin text-indigo-500" />
                        </div>
                    ) : interviews.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            No interviews found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="p-4 pl-6">Topic</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Sentiment</th>
                                        <th className="p-4 pr-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {interviews.map((interview) => (
                                        <tr key={interview.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-4 pl-6 font-medium text-gray-900">
                                                {getTopicTitle(interview.topic_id)}
                                            </td>
                                            <td className="p-4 text-gray-500 flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(interview.created_at).toLocaleDateString()}
                                                <span className="text-xs text-gray-400">
                                                    {new Date(interview.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${interview.status === 'completed'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                    }`}>
                                                    {interview.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {interview.report?.sentiment || '-'}
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <Link
                                                    href={`/report/${interview.topic_id}?interviewId=${interview.id}`}
                                                    className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <FileText size={16} />
                                                    View Report
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

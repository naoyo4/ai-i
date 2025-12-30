'use client';

import { INTERVIEW_TOPICS } from '@/lib/types';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Share2, Download, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';

// Define the shape of our report data
type ReportData = {
    summary: string;
    sentiment: string;
    key_insights: string[];
    focus_area: string;
};

function ReportContent() {
    const params = useParams();
    const searchParams = useSearchParams();

    // Safety check for params
    const id = params?.id as string;
    const interviewId = searchParams.get('interviewId');

    const topic = INTERVIEW_TOPICS.find(t => t.id === id);

    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState('');

    useEffect(() => {
        const generateReport = async () => {
            const storedMessages = localStorage.getItem('interview-messages');

            // Prioritize interviewId for server-side generation
            if (!interviewId && !storedMessages) {
                // Fallback if no messages found (e.g., navigated directly)
                setReport({
                    summary: "No interview data found. Please complete an interview first.",
                    sentiment: "N/A",
                    key_insights: [],
                    focus_area: "N/A"
                });
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/report', {
                    method: 'POST',
                    body: JSON.stringify({
                        topicId: id,
                        interviewId: interviewId || undefined,
                        messages: storedMessages ? JSON.parse(storedMessages) : []
                    })
                });

                if (!response.ok) throw new Error('Failed to generate report');

                const data = await response.json();
                setReport(data);
            } catch (err) {
                console.error(err);
                // Fallback to mock data to show UI even if API fails (no key)
                setReport({
                    summary: "Note: Real AI generation failed (likely due to missing API Key). Showing mock report.\n\nThe participant shared valuable insights regarding the topic. They highlighted key strengths and areas for improvement, demonstrating a clear understanding of the subject matter.",
                    sentiment: "Constructive (Mock)",
                    key_insights: ["User values transparency", "Suggested UI improvements", "Positive overall impression"],
                    focus_area: "User Experience"
                });
            } finally {
                setLoading(false);
            }
        };

        if (topic) {
            generateReport();
        }
    }, [id, topic, interviewId]);

    if (!topic) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Navigation */}
                <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-4">
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Home
                </Link>

                {/* Success Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-emerald-100 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Interview Completed!</h1>
                    <p className="text-gray-500">
                        Thank you for sharing your thoughts on <span className="font-semibold text-gray-800">{topic.title}</span>.
                    </p>
                </div>

                {/* Summary Section */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6 relative min-h-[300px]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">AI Summary</h2>
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">Auto-Generated</span>
                    </div>

                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl z-10">
                            <Loader2 size={32} className="text-indigo-600 animate-spin mb-2" />
                            <span className="text-sm text-gray-500">Analyzing conversation...</span>
                        </div>
                    ) : report ? (
                        <>
                            <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                                {report.summary}
                            </div>

                            {/* Key Insights */}
                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Key Insights</h3>
                                <div className="grid gap-3">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <span className="block text-xs text-gray-400 mb-1">Sentiment</span>
                                        <span className="font-medium text-emerald-600">{report.sentiment}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <span className="block text-xs text-gray-400 mb-1">Focus Area</span>
                                        <span className="font-medium text-gray-800">{report.focus_area}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <span className="block text-xs text-gray-400 mb-1">Takeaways</span>
                                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                            {report.key_insights.map((insight, i) => (
                                                <li key={i}>{insight}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Could not generate report.</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <Download size={18} />
                        Download PDF
                    </button>
                    <button className="flex-1 bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
                        <Share2 size={18} />
                        Share Report
                    </button>
                </div>

            </div>
        </div>
    );
}

export default function ReportPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}>
            <ReportContent />
        </Suspense>
    );
}

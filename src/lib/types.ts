export type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
};

export type InterviewTopic = {
    id: string;
    title: string;
    description: string;
    questionsCount: number;
    durationMinutes: number;
    icon: string; // lucide icon name or emoji
    color: string;
};

export const INTERVIEW_TOPICS: InterviewTopic[] = [
    {
        id: 'event-feedback',
        title: 'Event Feedback',
        description: 'Share your thoughts on the recent event.',
        questionsCount: 5,
        durationMinutes: 5,
        icon: 'mic',
        color: 'bg-blue-100 text-blue-600',
    },
    {
        id: 'policy-hearing',
        title: 'Policy Hearing',
        description: 'Discuss your views on the new company policy.',
        questionsCount: 10,
        durationMinutes: 15,
        icon: 'file-text',
        color: 'bg-green-100 text-green-600',
    },
    {
        id: 'user-interview',
        title: 'User Interview',
        description: 'Help us improve our product with your feedback.',
        questionsCount: 7,
        durationMinutes: 10,
        icon: 'users',
        color: 'bg-purple-100 text-purple-600',
    },
];

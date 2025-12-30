import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { supabase } from '@/lib/supabase';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, topicId, interviewId } = await req.json();

    // Basic system prompt based on topic
    // In a real app, this would be more dynamic and robust
    const systemPrompt = `
    You are an AI interviewer conducting a professional interview about: ${topicId}.
    Your goal is to ask insightful questions to gather feedback or opinions.
    
    Guidelines:
    - Ask one question at a time.
    - Be polite, professional, and encouraging.
    - Keep your responses concise (under 3 sentences).
    - If the user gives a short answer, ask for elaboration.
    - Start the conversation by introducing the topic if it's the first message.
  `;

    try {
        const result = streamText({
            model: google('gemini-1.5-flash'), // Using Google Gemini model
            messages,
            system: systemPrompt,
            onFinish: async ({ text }) => {
                // If we have a valid interviewId (and it's not a mock one), save to DB
                if (interviewId && !interviewId.toString().startsWith('mock-') && supabase) {
                    const newMessages = [
                        ...messages,
                        { role: 'assistant', content: text, createdAt: new Date() }
                    ];

                    await supabase
                        .from('interviews')
                        .update({ messages: newMessages })
                        .eq('id', interviewId);
                }
            }
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('AI Error:', error);
        return new Response("Error communicating with AI", { status: 500 });
    }
}

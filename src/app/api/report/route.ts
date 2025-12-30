import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { supabase } from '@/lib/supabase';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages: bodyMessages, topicId, interviewId } = await req.json();

    let conversationMessages = bodyMessages;

    // If interviewId is provided and real, try to fetch messages from DB first
    if (interviewId && !interviewId.startsWith('mock-') && supabase) {
        const { data } = await supabase
            .from('interviews')
            .select('messages')
            .eq('id', interviewId)
            .single();

        if (data?.messages) {
            conversationMessages = data.messages;
        }
    }

    if (!conversationMessages || conversationMessages.length === 0) {
        return new Response("No messages to summarize", { status: 400 });
    }

    // Basic prompt to summarize the interview
    const systemPrompt = `
    You are an expert analyst. You have just conducted an interview on the topic: ${topicId}.
    Analyze the following conversation and provide a structured report.
    
    Return the response in JSON format (do not wrap in markdown code blocks) with the following keys:
    - summary (string): A paragraph summarizing the user's feedback.
    - sentiment (string): One of 'Positive', 'Neutral', 'Negative', 'Constructive'.
    - key_insights (array of strings): 3 key takeaways.
    - focus_area (string): The main area the user seemed concerned about.
  `;

    // Format conversation for the prompt
    const conversation = conversationMessages.map((m: any) => `${m.role}: ${m.content}`).join('\n');

    try {
        const { text } = await generateText({
            model: google('gemini-1.5-flash'), // Using Google Gemini model
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: conversation }
            ],
        });

        // Simple JSON parsing (in production use Zod or structured output mode)
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const reportData = JSON.parse(cleanedText);

        // Save report to DB
        // Check if supabase exists (env vars present) before trying to save
        if (interviewId && !interviewId.startsWith('mock-') && supabase) {
            await supabase
                .from('interviews')
                .update({
                    report: reportData,
                    status: 'completed'
                })
                .eq('id', interviewId);
        }

        return Response.json(reportData);
    } catch (error) {
        console.error('Report Error:', error);
        return new Response("Error generating report", { status: 500 });
    }
}

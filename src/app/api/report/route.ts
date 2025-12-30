import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { supabase } from '@/lib/supabase';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages: bodyMessages, topicId, interviewId } = await req.json();

    let conversationMessages = bodyMessages;

    // Only try to fetch from DB if messages weren't provided in the request
    if ((!conversationMessages || conversationMessages.length === 0) &&
        interviewId &&
        !interviewId.startsWith('mock-') &&
        supabase) {
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
        return new Response(JSON.stringify({ error: "No messages to summarize" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
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

    // Format conversation for the prompt - handle both old and new message formats
    const conversation = conversationMessages.map((m: any) => {
        let content = '';

        // Handle UIMessage format (with parts)
        if (m.parts && Array.isArray(m.parts)) {
            content = m.parts
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join('');
        }
        // Handle old format (with content)
        else if (m.content) {
            content = m.content;
        }

        return `${m.role}: ${content}`;
    }).join('\n');

    try {
        const { text } = await generateText({
            model: google('gemini-2.0-flash-exp'),
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: conversation }
            ],
        });

        // Simple JSON parsing (in production use Zod or structured output mode)
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const reportData = JSON.parse(cleanedText);

        // Save report to DB
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
        return new Response(JSON.stringify({ error: "Error generating report" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

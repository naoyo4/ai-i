import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { topicId } = await req.json();

        // Fallback if Supabase not configured
        if (!supabase) {
            console.warn('Supabase not configured. Returning mock session.');
            return NextResponse.json({ id: 'mock-id-' + Date.now(), mock: true });
        }

        // 1. Create a new interview record in Supabase
        const { data, error } = await supabase
            .from('interviews')
            .insert([
                {
                    topic_id: topicId,
                    status: 'started',
                    messages: [] // Init empty
                }
            ])
            .select() // Return the created record (with ID)
            .single();

        if (error) {
            console.error('Supabase Create Error:', error);
            return NextResponse.json({ id: 'mock-id-' + Date.now(), mock: true });
        }

        return NextResponse.json(data);

    } catch (e) {
        console.error('API Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

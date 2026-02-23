import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { topicId } = await req.json();

        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' },
                { status: 503 }
            );
        }

        const { data, error } = await supabase
            .from('interviews')
            .insert([{ topic_id: topicId, status: 'started', messages: [] }])
            .select()
            .single();

        if (error) {
            console.error('Supabase Create Error:', JSON.stringify(error));
            return NextResponse.json(
                {
                    error: 'Failed to create interview session',
                    detail: {
                        code: error.code,
                        message: error.message,
                        hint: error.hint,
                        details: error.details,
                    }
                },
                { status: 500 }
            );
        }

        return NextResponse.json(data);

    } catch (e) {
        console.error('API Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

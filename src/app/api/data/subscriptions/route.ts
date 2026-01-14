import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar dispositivos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscriptions: subscriptions || [],
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Subscriptions API error:', error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}

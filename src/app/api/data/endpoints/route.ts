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

    const { data: endpoints, error } = await supabase
      .from('endpoints')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching endpoints:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar notificações' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      endpoints: endpoints || [],
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Endpoints API error:', error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}

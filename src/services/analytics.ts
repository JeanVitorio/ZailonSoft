import { createClient } from '@supabase/supabase-js';


const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!);


export async function getUpcomingVisits(lojaId: string, start: Date, end: Date) {
const { data, error } = await supabase
.rpc('rpc_upcoming_visits', {
p_loja: lojaId,
p_start: start.toISOString(),
p_end: end.toISOString(),
});
if (error) throw error;
return data as Array<{ chat_id: string; name: string | null; phone: string | null; visit_at: string; stage: string | null }>;
}


export async function getVisitsByDay(lojaId: string, start: Date, end: Date) {
const { data, error } = await supabase
.rpc('rpc_visits_by_day', {
p_loja: lojaId,
p_start: new Date(start.toDateString()),
p_end: new Date(end.toDateString()),
});
if (error) throw error;
return (data || []) as Array<{ day: string; visits: number }>;
}
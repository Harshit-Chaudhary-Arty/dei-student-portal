import { supabase } from './supabaseClient';

export async function createAnnouncement(title, description, label) {
    const { data, error } = await supabase
        .from('announcements')
        .insert([{ title, description, label, is_admin: true }])
        .select();

    if (error) {
        console.error('Error creating announcement:', error.message);
        return { data: null, error };
    }
    return { data: data?.[0] || null, error: null };
}

export async function getAnnouncements() {
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_admin', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching announcements:', error.message);
        return [];
    }
    return data || [];
}

export async function deleteAnnouncement(id) {
    const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting announcement:', error.message);
        return { success: false, error };
    }
    return { success: true, error: null };
}

import { supabase } from './supabaseClient';

export async function uploadAttachment(file) {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `announcement-${Date.now()}.${fileExt}`;
    const filePath = `announcements/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('leave-attachments')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('leave-attachments')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

export async function createAnnouncement(title, description, label, attachmentUrl = null) {
    const { data, error } = await supabase
        .from('announcements')
        .insert([{ title, description, label, is_admin: true, attachment_url: attachmentUrl }])
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

export async function deleteAnnouncement(id, attachmentUrl = null) {
    // Remove storage file first if one exists
    if (attachmentUrl) {
        try {
            // Extract the path after the bucket name in the public URL
            const marker = '/leave-attachments/';
            const idx = attachmentUrl.indexOf(marker);
            if (idx !== -1) {
                const storagePath = attachmentUrl.slice(idx + marker.length);
                await supabase.storage.from('leave-attachments').remove([storagePath]);
            }
        } catch (storageErr) {
            console.warn('Could not remove attachment from storage:', storageErr.message);
        }
    }

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

import { supabase } from './supabaseClient';

export const leaveService = {
    async getTeachers() {
        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .order('name');
        if (error) throw error;
        return data;
    },

    async createLeaveRequest(requestData) {
        const { data, error } = await supabase
            .from('leave_requests')
            .insert([requestData])
            .select();
        if (error) throw error;
        return data[0];
    },

    async getStudentLeaveRequests(rollNo) {
        const { data, error } = await supabase
            .from('leave_requests')
            .select(`
        *,
        teachers (
          name
        )
      `)
            .eq('roll_no', rollNo)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getAllLeaveRequests() {
        const { data, error } = await supabase
            .from('leave_requests')
            .select(`
        *,
        teachers (
          name
        )
      `)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async updateLeaveRequestStatus(id, status, teacherComment) {
        const { data, error } = await supabase
            .from('leave_requests')
            .update({
                status,
                teacher_comment: teacherComment,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async deleteLeaveRequest(id) {
        const { error } = await supabase
            .from('leave_requests')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    async uploadAttachment(file, rollNo) {
        if (!file) return null;

        // Create a unique file name to avoid collisions
        const fileExt = file.name.split('.').pop();
        const fileName = `${rollNo}-${Date.now()}.${fileExt}`;
        const filePath = `attachments/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('leave-attachments')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('leave-attachments')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
};

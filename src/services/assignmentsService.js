import { supabase } from './supabaseClient';

export const assignmentsService = {

  async getTeachers() {
    const { data, error } = await supabase
      .from('teachers')
      .select('id, name')
      .order('name');
    if (error) throw error;
    return data;
  },

  // Filter courses by branch + semester + specialization
  async getCourses(branch, semester, specialization) {
    let query = supabase
      .from('courses')
      .select('*')
      .order('course_name');

    if (branch) query = query.eq('branch', branch);
    if (semester) query = query.eq('semester', parseInt(semester));
    if (specialization && specialization !== 'General')
      query = query.eq('specialization', specialization);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Fetch all assignments with joined names
  async getAssignments() {
    const { data, error } = await supabase
      .from('teacher_course_assignments')
      .select(`
        id,
        branch,
        semester,
        year,
        specialization,
        assigned_by,
        created_at,
        teachers ( id, name ),
        courses ( id, course_name, course_code )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createAssignment({ teacher_id, course_id, branch, semester, year, specialization, assigned_by }) {
    const { data, error } = await supabase
      .from('teacher_course_assignments')
      .insert([{ teacher_id, course_id, branch, semester: parseInt(semester), year, specialization, assigned_by }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteAssignment(id) {
    const { error } = await supabase
      .from('teacher_course_assignments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
};

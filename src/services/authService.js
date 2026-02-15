import { supabase } from './supabaseClient';

// Signup Service - Creates new student account
export const signupStudent = async (studentData) => {
  try {
    const { name, rollNo, branch, year, password } = studentData;

    // Check if roll number already exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('roll_no')
      .eq('roll_no', rollNo)
      .single();

    if (existingStudent) {
      return {
        success: false,
        error: 'Roll number already exists'
      };
    }

    // Insert new student
    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          name: name,
          roll_no: rollNo,
          branch: branch,
          year: year,
          password: password // In production, hash this password!
        }
      ])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data,
      message: 'Account created successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Signup failed'
    };
  }
};

// Login Service - Verifies credentials and returns student data
export const loginStudent = async (loginData) => {
  try {
    const { rollNo, password } = loginData;

    // Query student by roll number and password
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('roll_no', rollNo)
      .eq('password', password)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: 'Invalid roll number or password'
      };
    }

    // Remove password from returned data for security
    const { password: _, ...studentData } = data;

    return {
      success: true,
      data: studentData,
      message: 'Login successful!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Login failed'
    };
  }
};

// Optional: Get student by ID
export const getStudentById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const { password: _, ...studentData } = data;
    return { success: true, data: studentData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
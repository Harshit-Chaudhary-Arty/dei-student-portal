import { supabase } from './supabaseClient';

// Get timetable for a student based on branch and year
export const getTimetable = async (branch, year) => {
  try {
    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('branch', branch)
      .eq('year', year)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
  
};

// Helper to format time
export const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Helper to get current day
export const getCurrentDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

// Helper to check if class is happening now
export const isClassHappeningNow = (startTime, endTime) => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  return currentTime >= startTime && currentTime <= endTime;
};
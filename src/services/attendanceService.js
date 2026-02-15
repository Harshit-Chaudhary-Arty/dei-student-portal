export const getAttendanceFromSheet = async (sheetId, rollNo) => {
  try {
    // IMPORTANT: must be gviz CSV endpoint
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

    const res = await fetch(url);
    const text = await res.text();

    // Parse CSV safely
    const rows = text
      .trim()
      .split('\n')
      .map(row =>
        row
          .split(',')
          .map(cell => cell.replace(/^"|"$/g, '').trim())
      );

    const header = rows[0];       // Dates row
    const dataRows = rows.slice(1);

    // Roll No is column B (index 1)
    const studentRow = dataRows.find(
      r => r[1] === String(rollNo)
    );

    if (!studentRow) {
      return { success: true, data: [], stats: { total: 0, present: 0, absent: 0, percentage: 0 } };
    }

    // Attendance starts from column D (index 3)
    const attendance = [];
    let presentCount = 0;
    let absentCount = 0;

    for (let i = 3; i < header.length; i++) {
      const status = studentRow[i] || '-';
      
      if (status === 'P') presentCount++;
      if (status === 'A') absentCount++;

      attendance.push({
        date: header[i],
        status: status
      });
    }

    const totalClasses = presentCount + absentCount;
    const percentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;

    // Calculate classes needed to reach 75%
    let classesNeeded = 0;
    if (percentage < 75) {
      // Formula: (present + x) / (total + x) = 0.75
      // Solving: x = (0.75 * total - present) / 0.25
      classesNeeded = Math.ceil((0.75 * totalClasses - presentCount) / 0.25);
    }

    return { 
      success: true, 
      data: attendance,
      stats: {
        total: totalClasses,
        present: presentCount,
        absent: absentCount,
        percentage: parseFloat(percentage),
        classesNeeded: classesNeeded
      }
    };
  } catch (error) {
    console.error('Attendance fetch error:', error);
    return { success: false, error: error.message };
  }
};

// Get attendance for all subjects
export const getAllSubjectsAttendance = async (subjects, rollNo) => {
  try {
    const allAttendance = [];
    let totalPresent = 0;
    let totalClasses = 0;

    for (const subject of subjects) {
      const result = await getAttendanceFromSheet(subject.sheetId, rollNo);
      
      if (result.success) {
        allAttendance.push({
          subject: subject.name,
          ...result.stats,
          records: result.data
        });
        
        totalPresent += result.stats.present;
        totalClasses += result.stats.total;
      }
    }

    const overallPercentage = totalClasses > 0 
      ? ((totalPresent / totalClasses) * 100).toFixed(2) 
      : 0;

    return {
      success: true,
      subjects: allAttendance,
      overall: {
        total: totalClasses,
        present: totalPresent,
        absent: totalClasses - totalPresent,
        percentage: parseFloat(overallPercentage)
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
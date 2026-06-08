const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase.cjs');

// 1. GET /api/attendance - Fetch all submissions
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .select('*');

    if (error) {
      console.error("GET ATTENDANCE ERROR:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. POST /api/attendance - Insert submission (delete duplicates first)
router.post('/', async (req, res) => {
  const { department, year, section, absent_count, date, status } = req.body;

  const record = {
    date,
    department,
    year,
    section,
    absentees_count: Number(absent_count),
    status
  };

  try {
    // 2.1. Clear matching duplicate
    const { error: deleteError } = await supabase
      .from('attendance_sessions')
      .delete()
      .match({
        date,
        department,
        year,
        section
      });

    if (deleteError) {
      console.error("SUPABASE CLEAR DUPLICATE ERROR:", deleteError);
    }

    // 2.2. Insert new record (id is auto-generated as UUID by database)
    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert([record])
      .select();

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("Attendance saved successfully:", data);
    res.json({ message: "Attendance saved successfully", data });
  } catch (err) {
    console.error("Backend post exception:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. PUT /api/attendance/:id - Update status (Approve/Reject)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, absentees_count } = req.body;

  try {
    const updatePayload = { status };
    if (absentees_count !== undefined && absentees_count !== null) {
      updatePayload.absentees_count = Number(absentees_count);
    }
    if (status === 'Approved') {
      updatePayload.forwarded_to_admin = true;
    }

    const { data, error } = await supabase
      .from('attendance_sessions')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error("SUPABASE UPDATE ERROR:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Attendance updated successfully", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. DELETE /api/attendance/:id - Delete a submission
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('attendance_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("SUPABASE DELETE ERROR:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Attendance deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. POST /api/attendance/clear - Clear submissions
router.post('/clear', async (req, res) => {
  const { department } = req.body;

  try {
    let query = supabase.from('attendance_sessions').delete();
    if (department) {
      query = query.eq('department', department);
    } else {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { error } = await query;
    if (error) {
      console.error("SUPABASE CLEAR ERROR:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Attendance history cleared successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

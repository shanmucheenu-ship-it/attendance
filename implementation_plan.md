# Detailed Attendance Module Implementation Plan

## Objective
Add a new detailed attendance module for Faculty and HOD, while preserving the existing 'absentees count only' flow.

## 1. Faculty Page (New Module: `DetailedAttendance.jsx`)
- **Location:** `src/pages/faculty/DetailedAttendance.jsx`
- **Features:**
  - Date and Year selection for all departments.
  - Section selection restricted to 'Computer' department faculties.
  - Table showing `Regno`, `Name`, `Gender`, `Attendance`.
  - Fetch accurate student details based on selected Year/Section/Department.
  - Interactive "Present/Absent" toggle for each student (Default: Present).
  - Real-time calculation of total absentees at the bottom.
  - Submit button to send the detailed absentee list to HOD.

## 2. HOD Page (New Module: `DetailedAttendanceReview.jsx`)
- **Location:** `src/pages/hod/DetailedAttendanceReview.jsx`
- **Features:**
  - View incoming detailed attendance requests from faculties.
  - Review table with absentees (`Regno`, `Name`).
  - Option to edit (mark someone present/absent) before final approval.
  - Final approval sends just the count to the existing `attendance_sessions` system to ensure the Principal dashboard works exactly as before.

## 3. State Management (`AppContext.jsx`)
- Add a new state `detailedSessions` synchronized with `localStorage` to store the detailed absentees list without needing to modify the existing Supabase `attendance_sessions` schema.
- Create functions: `submitDetailedAttendance`, `approveDetailedAttendance`, `updateDetailedAttendance`.
- On HOD approval, it will also call the existing `submitAttendance` and `approveSubmission` methods to push the final count to Supabase so the Principal sees the numbers correctly.

## 4. Routing & Navigation
- **`AppRoutes.jsx`:** Add routes `/faculty/detailed-submit` and `/hod/detailed-review`.
- **`Sidebar.jsx`:** Add new links for Faculty ("Detailed Attendance") and HOD ("Detailed Review").

## 5. Non-Destructive Approach
- The existing `SubmitAttendance.jsx` and `HodDashboard.jsx` will remain completely untouched.
- "Supabase Connected" text on the landing page has already been removed.

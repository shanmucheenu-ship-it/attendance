export function printSectionReport({ collegeName = "Sri Ramakrishna Polytechnic College", department, yearSection, date, summary, students }) {
  const printWindow = window.open('', '_blank');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Attendance Report - ${department} ${yearSection}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
          color: #0f172a; 
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        .header h1 { margin: 0 0 10px 0; font-size: 28px; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; }
        .header h2 { margin: 0 0 8px 0; font-size: 20px; color: #334155; }
        .header h3 { margin: 0 0 8px 0; font-size: 16px; color: #475569; font-weight: 500; }
        .header p { margin: 0; color: #64748b; font-size: 14px; }
        
        .summary-grid { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
          padding: 15px 25px; 
          background-color: #f8fafc; 
          border: 1px solid #e2e8f0; 
          border-radius: 8px; 
        }
        .summary-item { text-align: center; }
        .summary-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; display: block; }
        .summary-value { font-size: 18px; font-weight: 700; color: #0f172a; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 50px; font-size: 14px; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #f1f5f9; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 12px; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .status-present { color: #16a34a; font-weight: 500; }
        .status-absent { color: #dc2626; font-weight: 500; }
        
        .signatures { 
          display: flex; 
          justify-content: space-between; 
          margin-top: 80px; 
          padding: 0 40px;
          page-break-inside: avoid;
        }
        .sig-block { 
          text-align: center; 
          width: 200px; 
        }
        .sig-line {
          border-top: 1px solid #0f172a;
          margin-bottom: 10px;
        }
        .sig-label {
          font-weight: 600;
          color: #334155;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${collegeName}</h1>
        <h2>Department of ${department}</h2>
        <h3>${yearSection}</h3>
        <p>Date: ${date}</p>
      </div>
      
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">Total Students</span>
          <span class="summary-value">${summary.total}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Present</span>
          <span class="summary-value" style="color: #16a34a;">${summary.present}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Absent</span>
          <span class="summary-value" style="color: #dc2626;">${summary.absent}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Attendance %</span>
          <span class="summary-value">${summary.percentage}%</span>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th width="20%">Reg No</th>
            <th width="50%">Student Name</th>
            <th width="30%">Attendance Status</th>
          </tr>
        </thead>
        <tbody>
          ${students.length > 0 ? students.map(s => `
            <tr>
              <td>${s.regNo}</td>
              <td>${s.name}</td>
              <td class="${s.status === 'Present' ? 'status-present' : 'status-absent'}">${s.status}</td>
            </tr>
          `).join('') : `<tr><td colspan="3" style="text-align: center; py: 20px;">No students found for this section.</td></tr>`}
        </tbody>
      </table>
      
      <div class="signatures">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-label">HOD Signature</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-label">Principal Signature</div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

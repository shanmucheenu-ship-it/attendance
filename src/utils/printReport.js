export function printReport(title, date, summary, students) {
  const printWindow = window.open('', '_blank');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Attendance Report</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 20px; color: #0f172a; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0 0 10px 0; font-size: 24px; }
        .header h2 { margin: 0 0 5px 0; font-size: 18px; color: #475569; }
        .header p { margin: 0; color: #64748b; }
        .summary { margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .summary p { margin: 5px 0; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #f8fafc; font-weight: 600; }
        .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; }
        .sig-block { text-align: center; width: 200px; border-top: 1px solid #cbd5e1; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Sri Ramakrishna Polytechnic College</h1>
        <h2>Department of Computer Science</h2>
        <p>Attendance Report — ${date}</p>
      </div>
      
      <div class="summary">
        <p>Summary:</p>
        <p>Total: ${summary.total} | Present: ${summary.present}</p>
        <p>Absent: ${summary.absent} | Percentage: ${summary.percentage}%</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Reg No</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s => `
            <tr>
              <td>${s.regNo}</td>
              <td>${s.name}</td>
              <td>${s.gender}</td>
              <td>${s.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="signatures">
        <div class="sig-block">HOD Signature</div>
        <div class="sig-block">Principal Signature</div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for resources to load before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

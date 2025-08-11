import express from 'express';
import cors from 'cors';
import { query, execProc } from './db';

// Typing fallback due to ambient type resolution issues in this environment
const app: any = express();
app.use(cors());
app.use(express.json());

app.get('/api/cases', async (_req, res) => {
  try {
    const rows = await query('SELECT TOP 200 * FROM dbo.vw_ActiveCases ORDER BY reportedDate DESC');
    res.json({ success: true, data: rows });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/cases', async (req, res) => {
  try {
    const { employeeId, employeeFirstName, employeeLastName, isPrmCase, dok, incidentDate, reportedDate, description, createdBy } = req.body;
    const rows = await execProc('usp_CreateCase', {
      EmployeeId: employeeId,
      EmployeeFirstName: employeeFirstName,
      EmployeeLastName: employeeLastName,
      IsPrmCase: isPrmCase ? 1 : 0,
      DOK: dok,
      IncidentDate: incidentDate,
      ReportedDate: reportedDate,
      Description: description ?? '',
      CreatedBy: createdBy ?? ''
    });
    res.json({ success: true, data: rows });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

const port = process.env.API_PORT || 4000;
app.listen(port, () => console.log(`API listening on ${port}`));

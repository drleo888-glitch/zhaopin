import express from 'express';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(express.json());

const db = new Database('ksk.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    dob TEXT NOT NULL,
    cccd TEXT NOT NULL,
    deadline TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    hospital_id TEXT,
    appointment_date TEXT,
    result_notes TEXT,
    result_flags TEXT,
    medical_notes TEXT,
    final_result TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

function mapRecord(row: any) {
  return {
    id: row.id,
    candidate: {
      id: row.cccd,
      name: row.name,
      gender: row.gender,
      dob: row.dob,
      cccd: row.cccd,
    },
    status: row.status,
    deadline: row.deadline || undefined,
    hospitalId: row.hospital_id || undefined,
    appointmentDate: row.appointment_date || undefined,
    resultNotes: row.result_notes || undefined,
    resultFlags: row.result_flags ? JSON.parse(row.result_flags) : undefined,
    medicalNotes: row.medical_notes || undefined,
    finalResult: row.final_result || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/records — lấy toàn bộ hồ sơ
app.get('/api/records', (_req, res) => {
  const rows = db.prepare('SELECT * FROM records ORDER BY created_at DESC').all();
  res.json(rows.map(mapRecord));
});

// POST /api/records — tạo một hồ sơ mới
app.post('/api/records', (req, res) => {
  const { name, gender, dob, cccd, deadline } = req.body;
  if (!name || !gender || !dob || !cccd) {
    res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    return;
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO records (id, name, gender, dob, cccd, deadline, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
  `).run(id, name, gender, dob, cccd, deadline ?? null, now, now);
  const row = db.prepare('SELECT * FROM records WHERE id = ?').get(id);
  res.status(201).json(mapRecord(row));
});

// POST /api/records/import — import hàng loạt từ Excel
app.post('/api/records/import', (req, res) => {
  const items: any[] = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
    return;
  }

  const insertStmt = db.prepare(`
    INSERT INTO records (id, name, gender, dob, cccd, deadline, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
  `);

  const insertMany = db.transaction((rows: any[]) => {
    const now = new Date().toISOString();
    return rows.map(item => {
      const id = randomUUID();
      insertStmt.run(id, item.name, item.gender, item.dob, item.cccd, item.deadline ?? null, now, now);
      return db.prepare('SELECT * FROM records WHERE id = ?').get(id);
    });
  });

  const inserted = insertMany(items);
  res.status(201).json(inserted.map(mapRecord));
});

// PATCH /api/records/:id — cập nhật trạng thái hồ sơ
app.patch('/api/records/:id', (req, res) => {
  const { id } = req.params;
  const { status, hospitalId, appointmentDate, resultNotes, resultFlags, medicalNotes, finalResult } = req.body;

  const row = db.prepare('SELECT * FROM records WHERE id = ?').get(id) as any;
  if (!row) {
    res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
    return;
  }

  const resultFlagsStr = resultFlags !== undefined
    ? JSON.stringify(resultFlags)
    : row.result_flags;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE records SET
      status = ?,
      hospital_id = ?,
      appointment_date = ?,
      result_notes = ?,
      result_flags = ?,
      medical_notes = ?,
      final_result = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    status ?? row.status,
    hospitalId ?? row.hospital_id,
    appointmentDate ?? row.appointment_date,
    resultNotes ?? row.result_notes,
    resultFlagsStr,
    medicalNotes ?? row.medical_notes,
    finalResult ?? row.final_result,
    now,
    id
  );

  const updated = db.prepare('SELECT * FROM records WHERE id = ?').get(id);
  res.json(mapRecord(updated));
});

// GET /api/export — xuất CSV các hồ sơ đã thông báo (NOTIFIED)
app.get('/api/export', (_req, res) => {
  const rows = db.prepare(`
    SELECT * FROM records WHERE status = 'NOTIFIED' ORDER BY updated_at DESC
  `).all() as any[];

  const header = 'Họ và tên,Giới tính,Ngày sinh,Căn cước công dân,Kết quả';
  const lines = rows.map(r => {
    const gender = r.gender === 'male' ? 'Nam' : 'Nữ';
    const result = r.final_result === 'PASSED' ? 'Đạt' : 'Không đạt';
    return `"${r.name}","${gender}","${r.dob}","${r.cccd}","${result}"`;
  });

  const csv = '\uFEFF' + [header, ...lines].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ket-qua-kham-suc-khoe.csv"');
  res.send(csv);
});

// Serve frontend build (production)
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend KSK chạy tại http://localhost:${PORT}`);
});

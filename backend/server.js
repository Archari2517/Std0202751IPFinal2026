require('dotenv').config();
const ArcKhe_express = require('express');
const ArcKhe_cors = require('cors');
const ArcKhe_mysql = require('mysql2/promise');

const ArcKhe_app = ArcKhe_express();
ArcKhe_app.use(ArcKhe_cors());
ArcKhe_app.use(ArcKhe_express.json());

const ArcKhe_PORT = process.env.PORT || 3000;

const ArcKhe_pool = ArcKhe_mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ip_std6730202751',
  waitForConnections: true,
  connectionLimit: 5,
});

// ---------- helpers ----------
function ArcKhe_formatRow(ArcKhe_row) {
  return {
    id: String(ArcKhe_row.ArcKhe_id),
    name: ArcKhe_row.ArcKhe_name,
    position: ArcKhe_row.ArcKhe_position,
    status: ArcKhe_row.ArcKhe_status,
    salary: Number(ArcKhe_row.ArcKhe_salary),
  };
}

function ArcKhe_isValidId(ArcKhe_id) {
  return /^[1-9]\d*$/.test(String(ArcKhe_id));
}

// ---------- DB init + seed ----------
async function ArcKhe_initDb() {
  await ArcKhe_pool.query(`
    CREATE TABLE IF NOT EXISTS ArcKhe_employees (
      ArcKhe_id INT AUTO_INCREMENT PRIMARY KEY,
      ArcKhe_name VARCHAR(100) NOT NULL,
      ArcKhe_position VARCHAR(100) NOT NULL,
      ArcKhe_status ENUM('Active','On Leave') NOT NULL DEFAULT 'Active',
      ArcKhe_salary DECIMAL(12,2) NOT NULL
    )
  `);
  const [ArcKhe_rows] = await ArcKhe_pool.query('SELECT COUNT(*) AS c FROM ArcKhe_employees');
  if (ArcKhe_rows[0].c === 0) {
    const ArcKhe_seed = [
      ['John Doe', 'Software Engineer', 'Active', 45000],
      ['Jane Smith', 'Product Manager', 'Active', 85000],
      ['Somchai Jaidee', 'Junior Developer', 'On Leave', 18500],
      ['Mali Rakdee', 'HR Officer', 'Active', 22000],
      ['Peter Chan', 'Senior Architect', 'Active', 95000],
      ['Nida Suksan', 'QA Engineer', 'Active', 40000],
    ];
    await ArcKhe_pool.query(
      'INSERT INTO ArcKhe_employees (ArcKhe_name, ArcKhe_position, ArcKhe_status, ArcKhe_salary) VALUES ?',
      [ArcKhe_seed]
    );
  }
}

// ---------- 1D K-Means ----------
function ArcKhe_kmeans1D(ArcKhe_values, ArcKhe_k = 3) {
  const ArcKhe_distinct = [...new Set(ArcKhe_values)].sort((a, b) => a - b);
  const ArcKhe_kUse = Math.min(ArcKhe_k, ArcKhe_distinct.length);
  if (ArcKhe_kUse === 0) return [];

  // initial centroids: spread evenly across distinct sorted values
  let ArcKhe_centroids = [];
  for (let i = 0; i < ArcKhe_kUse; i++) {
    const ArcKhe_idx = ArcKhe_kUse === 1 ? 0 : Math.round((i * (ArcKhe_distinct.length - 1)) / (ArcKhe_kUse - 1));
    ArcKhe_centroids.push(ArcKhe_distinct[ArcKhe_idx]);
  }

  let ArcKhe_assign = new Array(ArcKhe_values.length).fill(0);
  for (let ArcKhe_iter = 0; ArcKhe_iter < 100; ArcKhe_iter++) {
    // assign step
    ArcKhe_assign = ArcKhe_values.map((v) => {
      let ArcKhe_best = 0;
      for (let c = 1; c < ArcKhe_kUse; c++) {
        if (Math.abs(v - ArcKhe_centroids[c]) < Math.abs(v - ArcKhe_centroids[ArcKhe_best])) ArcKhe_best = c;
      }
      return ArcKhe_best;
    });
    // update step (empty cluster keeps old centroid)
    const ArcKhe_next = ArcKhe_centroids.map((old, c) => {
      const ArcKhe_members = ArcKhe_values.filter((_, i) => ArcKhe_assign[i] === c);
      return ArcKhe_members.length ? ArcKhe_members.reduce((s, x) => s + x, 0) / ArcKhe_members.length : old;
    });
    const ArcKhe_changed = ArcKhe_next.some((x, c) => Math.abs(x - ArcKhe_centroids[c]) > 1e-9);
    ArcKhe_centroids = ArcKhe_next;
    if (!ArcKhe_changed) break;
  }

  return ArcKhe_centroids
    .map((c, idx) => ({
      centroid: Math.round(c * 100) / 100,
      count: ArcKhe_assign.filter((a) => a === idx).length,
    }))
    .sort((a, b) => a.centroid - b.centroid);
}

// ---------- routes ----------
ArcKhe_app.post('/api/login', (ArcKhe_req, ArcKhe_res) => {
  const { username: ArcKhe_username, password: ArcKhe_password } = ArcKhe_req.body || {};
  if (ArcKhe_username === 'admin' && ArcKhe_password === 'password123') {
    return ArcKhe_res.status(200).json({ success: true, token: 'mock-jwt-token' });
  }
  return ArcKhe_res.status(401).json({ success: false, message: 'Invalid username or password' });
});

ArcKhe_app.get('/api/employees', async (ArcKhe_req, ArcKhe_res) => {
  try {
    const [ArcKhe_rows] = await ArcKhe_pool.query('SELECT * FROM ArcKhe_employees ORDER BY ArcKhe_id');
    ArcKhe_res.json(ArcKhe_rows.map(ArcKhe_formatRow));
  } catch (ArcKhe_err) {
    console.error(ArcKhe_err);
    ArcKhe_res.status(500).json({ success: false, message: 'Server error' });
  }
});

// NOTE: ต้องอยู่ก่อน route ที่มี /:id
ArcKhe_app.get('/api/employees/salary-clusters', async (ArcKhe_req, ArcKhe_res) => {
  try {
    const [ArcKhe_rows] = await ArcKhe_pool.query('SELECT ArcKhe_salary FROM ArcKhe_employees');
    const ArcKhe_salaries = ArcKhe_rows.map((r) => Number(r.ArcKhe_salary)).filter((n) => Number.isFinite(n));
    const ArcKhe_result = ArcKhe_kmeans1D(ArcKhe_salaries, 3);

    // เติมให้ครบ 3 tier เสมอ (กรณีพนักงานน้อย/เงินเดือนซ้ำ)
    const ArcKhe_clusters = [];
    for (let i = 0; i < 3; i++) {
      const ArcKhe_item = ArcKhe_result[i] || { centroid: 0, count: 0 };
      ArcKhe_clusters.push({ group: `Tier ${i + 1}`, centroid: ArcKhe_item.centroid, count: ArcKhe_item.count });
    }
    ArcKhe_res.status(200).json({ success: true, clusters: ArcKhe_clusters });
  } catch (ArcKhe_err) {
    console.error(ArcKhe_err);
    ArcKhe_res.status(500).json({ success: false, message: 'Server error' });
  }
});

ArcKhe_app.post('/api/employees', async (ArcKhe_req, ArcKhe_res) => {
  try {
    const ArcKhe_body = ArcKhe_req.body || {};
    const ArcKhe_name = typeof ArcKhe_body.name === 'string' ? ArcKhe_body.name.trim() : '';
    const ArcKhe_position = typeof ArcKhe_body.position === 'string' ? ArcKhe_body.position.trim() : '';
    const ArcKhe_rawSalary = ArcKhe_body.salary;
    const ArcKhe_salary =
      ArcKhe_rawSalary === '' || ArcKhe_rawSalary === null || ArcKhe_rawSalary === undefined
        ? NaN
        : Number(ArcKhe_rawSalary);

    if (!ArcKhe_name || !ArcKhe_position || ArcKhe_rawSalary === '' || ArcKhe_rawSalary == null) {
      return ArcKhe_res.status(400).json({ success: false, message: 'name, position and salary are required' });
    }
    if (!Number.isFinite(ArcKhe_salary) || ArcKhe_salary <= 0 || ArcKhe_salary > 9999999999) {
      return ArcKhe_res.status(400).json({ success: false, message: 'salary must be a positive number' });
    }
    if (ArcKhe_name.length > 100 || ArcKhe_position.length > 100) {
      return ArcKhe_res.status(400).json({ success: false, message: 'name/position too long (max 100)' });
    }

    const [ArcKhe_ins] = await ArcKhe_pool.query(
      'INSERT INTO ArcKhe_employees (ArcKhe_name, ArcKhe_position, ArcKhe_status, ArcKhe_salary) VALUES (?, ?, ?, ?)',
      [ArcKhe_name, ArcKhe_position, 'Active', ArcKhe_salary]
    );
    const [ArcKhe_rows] = await ArcKhe_pool.query('SELECT * FROM ArcKhe_employees WHERE ArcKhe_id = ?', [ArcKhe_ins.insertId]);
    ArcKhe_res.status(201).json(ArcKhe_formatRow(ArcKhe_rows[0]));
  } catch (ArcKhe_err) {
    console.error(ArcKhe_err);
    ArcKhe_res.status(500).json({ success: false, message: 'Server error' });
  }
});

ArcKhe_app.put('/api/employees/:id/status', async (ArcKhe_req, ArcKhe_res) => {
  try {
    const ArcKhe_id = ArcKhe_req.params.id;
    if (!ArcKhe_isValidId(ArcKhe_id)) {
      return ArcKhe_res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const [ArcKhe_upd] = await ArcKhe_pool.query(
      `UPDATE ArcKhe_employees
       SET ArcKhe_status = IF(ArcKhe_status = 'Active', 'On Leave', 'Active')
       WHERE ArcKhe_id = ?`,
      [ArcKhe_id]
    );
    if (ArcKhe_upd.affectedRows === 0) {
      return ArcKhe_res.status(404).json({ success: false, message: 'Employee not found' });
    }
    const [ArcKhe_rows] = await ArcKhe_pool.query('SELECT * FROM ArcKhe_employees WHERE ArcKhe_id = ?', [ArcKhe_id]);
    ArcKhe_res.json(ArcKhe_formatRow(ArcKhe_rows[0]));
  } catch (ArcKhe_err) {
    console.error(ArcKhe_err);
    ArcKhe_res.status(500).json({ success: false, message: 'Server error' });
  }
});

ArcKhe_app.delete('/api/employees/:id', async (ArcKhe_req, ArcKhe_res) => {
  try {
    const ArcKhe_id = ArcKhe_req.params.id;
    if (!ArcKhe_isValidId(ArcKhe_id)) {
      return ArcKhe_res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const [ArcKhe_del] = await ArcKhe_pool.query('DELETE FROM ArcKhe_employees WHERE ArcKhe_id = ?', [ArcKhe_id]);
    if (ArcKhe_del.affectedRows === 0) {
      return ArcKhe_res.status(404).json({ success: false, message: 'Employee not found' });
    }
    ArcKhe_res.json({ success: true });
  } catch (ArcKhe_err) {
    console.error(ArcKhe_err);
    ArcKhe_res.status(500).json({ success: false, message: 'Server error' });
  }
});
// ---------- EDIT employee (name, position, salary) ----------
ArcKhe_app.put('/api/employees/:id', async (ArcKhe_req, ArcKhe_res) => {
  try {
    const ArcKhe_id = ArcKhe_req.params.id;
    if (!ArcKhe_isValidId(ArcKhe_id)) {
      return ArcKhe_res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const ArcKhe_body = ArcKhe_req.body || {};
    const ArcKhe_name = typeof ArcKhe_body.name === 'string' ? ArcKhe_body.name.trim() : '';
    const ArcKhe_position = typeof ArcKhe_body.position === 'string' ? ArcKhe_body.position.trim() : '';
    const ArcKhe_rawSalary = ArcKhe_body.salary;
    const ArcKhe_salary =
      ArcKhe_rawSalary === '' || ArcKhe_rawSalary === null || ArcKhe_rawSalary === undefined
        ? NaN
        : Number(ArcKhe_rawSalary);

    if (!ArcKhe_name || !ArcKhe_position || ArcKhe_rawSalary === '' || ArcKhe_rawSalary == null) {
      return ArcKhe_res.status(400).json({ success: false, message: 'name, position and salary are required' });
    }
    if (!Number.isFinite(ArcKhe_salary) || ArcKhe_salary <= 0 || ArcKhe_salary > 9999999999) {
      return ArcKhe_res.status(400).json({ success: false, message: 'salary must be a positive number' });
    }
    if (ArcKhe_name.length > 100 || ArcKhe_position.length > 100) {
      return ArcKhe_res.status(400).json({ success: false, message: 'name/position too long (max 100)' });
    }

    const [ArcKhe_found] = await ArcKhe_pool.query('SELECT ArcKhe_id FROM ArcKhe_employees WHERE ArcKhe_id = ?', [ArcKhe_id]);
    if (ArcKhe_found.length === 0) {
      return ArcKhe_res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await ArcKhe_pool.query(
      'UPDATE ArcKhe_employees SET ArcKhe_name = ?, ArcKhe_position = ?, ArcKhe_salary = ? WHERE ArcKhe_id = ?',
      [ArcKhe_name, ArcKhe_position, ArcKhe_salary, ArcKhe_id]
    );
    const [ArcKhe_rows] = await ArcKhe_pool.query('SELECT * FROM ArcKhe_employees WHERE ArcKhe_id = ?', [ArcKhe_id]);
    ArcKhe_res.json(ArcKhe_formatRow(ArcKhe_rows[0]));
  } catch (ArcKhe_err) {
    console.error(ArcKhe_err);
    ArcKhe_res.status(500).json({ success: false, message: 'Server error' });
  }
});
// ---------- start ----------
ArcKhe_initDb()
  .then(() => {
    ArcKhe_app.listen(ArcKhe_PORT, () => console.log(`Server running on port ${ArcKhe_PORT}`));
  })
  .catch((ArcKhe_err) => {
    console.error('Database init failed:', ArcKhe_err.message);
    process.exit(1);
  });

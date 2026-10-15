# HR Manager & Salary Analytics System

Internet Programming Final Exam 2026

- **Backend:** Express.js + MySQL (`mysql2`)
- **Frontend:** React Native (Expo) + React Navigation

## Features

- Login (admin) with an alert on failure
- Employee dashboard: list, toggle status (Active / On Leave), delete with an "Are you sure?" confirmation
- Separate **Add Employee** page and **Edit Employee** page (client-side validation, no empty fields)
- **Analyze Salary Structure**: 1D K-Means (k=3) groups salaries into 3 tiers, shown as summary cards with a loading indicator
- Optional **Show Chart** button: salary distribution per tier and employee count per tier (hidden until pressed)

## Project structure

```
Std0202751IPFinal2026
├── backend    (Express.js API)
└── frontend   (React Native / Expo)
```

## Run the backend

```bash
cd backend
npm install
cp .env.example .env     # Windows: copy .env.example .env
# edit .env with the database credentials
npm start
```

Data is stored in the MySQL database provided by the instructor. The server creates the table `ArcKhe_employees` automatically and seeds 6 sample employees on first start.

`.env` values: `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (see `.env.example`).

### API endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/login` | Login (`admin` / `password123`), 401 if wrong |
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Add employee (`name`, `position`, `salary`; 400 if invalid) |
| PUT | `/api/employees/:id` | Edit employee (`name`, `position`, `salary`; 400 if invalid, 404 if not found) |
| PUT | `/api/employees/:id/status` | Toggle Active / On Leave |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/employees/salary-clusters` | 1D K-Means (k=3) salary tiers |

## Run the frontend

```bash
cd frontend
npm install
npx expo start
```

Press `w` for web, or scan the QR code with Expo Go.

The API address is set in `frontend/config.js` (`ArcKhe_API_URL`). The backend is deployed on the instructor's server at `http://119.59.102.161:3068`.

## Login

- Username: `admin`
- Password: `password123`

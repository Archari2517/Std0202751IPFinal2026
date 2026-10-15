# HR Manager & Salary Analytics System

Internet Programming Final Exam 2026

- **Backend:** Express.js + MySQL (`mysql2`)
- **Frontend:** React Native (Expo) + React Navigation

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

The server creates the table `ArcKhe_employees` automatically and seeds sample employees on first start.

`.env` values: `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

### API endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/login` | Login (`admin` / `password123`) |
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Add employee (`name`, `position`, `salary`; 400 if invalid) |
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

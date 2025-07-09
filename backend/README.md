
# SPK Siswa Berprestasi - PHP Backend API

## Instalasi

1. **Copy folder backend ke direktori web server** (htdocs untuk XAMPP)

2. **Install dependencies**:
   ```bash
   cd backend
   composer install
   ```

3. **Konfigurasi Database**:
   - Buka `config/database.php`
   - Sesuaikan kredensial database MySQL
   - Default: localhost, root, no password

4. **Import Database**:
   - Buka phpMyAdmin
   - Buat database `spk_siswa_berprestasi`
   - Import struktur SQL yang sudah disediakan

5. **Test API**:
   - URL: `http://localhost/backend/api/`
   - Login default: admin@example.com / password

## Struktur API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify JWT token

### Students
- `GET /api/students/` - Get all students
- `POST /api/students/` - Create new student
- `GET /api/students/scores` - Get student scores
- `POST /api/students/scores` - Save student scores

### Criteria
- `GET /api/criteria/` - Get all criteria

### AHP Calculation
- `POST /api/ahp/calculate` - Calculate AHP
- `GET /api/ahp/results` - Get AHP results
- `DELETE /api/ahp/results` - Reset AHP results

## Konfigurasi Frontend

Update `API_BASE_URL` di `src/api/client.ts`:
```javascript
const API_BASE_URL = 'http://localhost/backend/api';
```

## Default Login
- Email: admin@example.com
- Password: password

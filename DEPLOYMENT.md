# 🚀 Развертывание QalamFlow

## 📋 Содержание
- [Подключение Frontend к Backend](#подключение-frontend-к-backend)
- [Развертывание Backend](#развертывание-backend)
- [Развертывание MongoDB](#развертывание-mongodb)
- [Развертывание Frontend](#развертывание-frontend)

---

## 🔌 Подключение Frontend к Backend

### CORS настройка
CORS уже настроен в `backend/server.js`:
```javascript
app.use(cors());
```

Для продакшена можно ограничить разрешенные домены:
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

### API запросы
Frontend использует `fetch API` через утилиту `api/client.ts`.

В режиме разработки:
- Frontend работает на `http://localhost:3000`
- Backend работает на `http://localhost:5000`
- Vite proxy перенаправляет `/api/*` → `http://localhost:5000/api/*`

### Переменные окружения

#### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/qalamflow
JWT_SECRET=your_super_secret_key
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🖥️ Развертывание Backend

### Вариант 1: Heroku
```bash
# Установить Heroku CLI
# heroku login

cd backend
heroku create your-app-name
heroku config:set MONGO_URI="your_mongodb_atlas_uri"
heroku config:set JWT_SECRET="your_secret_key"
heroku config:set NODE_ENV=production
git push heroku main
```

### Вариант 2: Render.com
1. Создать Web Service на Render.com
2. Подключить GitHub репозиторий
3. Настроить:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
4. Добавить переменные окружения в Render Dashboard

### Вариант 3: VPS (DigitalOcean, AWS EC2)
```bash
# На сервере
sudo apt update
sudo apt install nodejs npm

# Установить PM2 для управления процессом
sudo npm install -g pm2

# Клонировать репозиторий
git clone your-repo-url
cd qalamflow/backend
npm install

# Создать .env файл
nano .env
# Добавить переменные окружения

# Запустить с PM2
pm2 start server.js --name qalamflow-backend
pm2 save
pm2 startup
```

---

## 🗄️ Развертывание MongoDB

### MongoDB Atlas (Рекомендуется для продакшена)
1. Зарегистрироваться на https://www.mongodb.com/cloud/atlas
2. Создать бесплатный кластер M0
3. Настроить Network Access (IP Whitelist) - добавить `0.0.0.0/0` для разрешения всех IP
4. Создать пользователя базы данных
5. Получить connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/qalamflow?retryWrites=true&w=majority
   ```
6. Добавить в переменные окружения backend

### Локальный MongoDB на VPS
```bash
# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Connection string
MONGO_URI=mongodb://localhost:27017/qalamflow
```

---

## 🌐 Развертывание Frontend

### Шаг 1: Сборка приложения
```bash
cd frontend
npm install
npm run build
```

### Вариант 1: Netlify
```bash
# Установить Netlify CLI
npm install -g netlify-cli

# Деплой
cd frontend
npm run build
netlify deploy --prod --dir=dist

# Настроить переменные окружения в Netlify Dashboard:
# VITE_API_URL=https://your-backend.herokuapp.com/api
```

**Настройка редиректов для SPA:**
Создать файл `frontend/public/_redirects`:
```
/*    /index.html   200
```

### Вариант 2: Vercel
```bash
# Установить Vercel CLI
npm install -g vercel

cd frontend
vercel

# Или через GitHub интеграцию:
# 1. Импортировать проект на vercel.com
# 2. Настроить Root Directory: frontend
# 3. Добавить переменную окружения VITE_API_URL
```

### Вариант 3: AWS S3 + CloudFront
```bash
# Сборка
cd frontend
npm run build

# Загрузка на S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Настроить CloudFront distribution для кеширования
# Настроить переменные окружения перед сборкой:
VITE_API_URL=https://your-backend.com/api npm run build
```

### Вариант 4: GitHub Pages
```bash
# 1. Обновить vite.config.ts:
export default defineConfig({
  base: '/qalamflow/',  # название репозитория
  # ...
})

# 2. Установить gh-pages
npm install -D gh-pages

# 3. Добавить в package.json scripts:
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# 4. Деплой
npm run deploy
```

---

## ✅ Проверка развертывания

После развертывания проверьте:

1. **Backend API**: Откройте `https://your-backend-url.com/` - должен вернуть `{"message": "QalamFlow API running"}`

2. **Frontend**: Откройте `https://your-frontend-url.com` - должен загрузиться интерфейс

3. **Подключение**: Попробуйте зарегистрироваться/войти

4. **CORS**: Проверьте Console в DevTools на ошибки CORS

---

## 🔒 Безопасность в продакшене

1. **JWT Secret**: Используйте сложный, случайный ключ
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **CORS**: Ограничьте разрешенные домены

3. **HTTPS**: Используйте SSL сертификаты (Let's Encrypt бесплатно)

4. **Rate Limiting**: Добавьте на backend для защиты от атак

5. **Environment Variables**: Никогда не коммитьте .env файлы в git

---

## 📞 Поддержка

При проблемах с развертыванием:
- Проверьте логи сервера
- Убедитесь, что все переменные окружения установлены
- Проверьте Network tab в DevTools браузера
- Проверьте CORS настройки

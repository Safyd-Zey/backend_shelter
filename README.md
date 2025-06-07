### **📌 README – Запуск проекта "Animal Shelter Backend"**  
Этот проект – **бэкенд для мобильного приложения приюта животных**, написанный на **Node.js (TypeScript) + MongoDB**.  

**Функционал:**  
✅ Аутентификация и авторизация (**JWT**)  
✅ Управление животными и приютами (**CRUD**)  
✅ Фильтрация животных по параметрам  
✅ Загрузка изображений (**Cloudinary**)  
✅ Поддержка потерянных и найденных животных (**геолокация, фото**)  
✅ Генерация **QR-кодов** для животных  
✅ **Чаты (WebSockets)** в реальном времени (**ws**)  
✅ Карта приютов (**OpenStreetMap + Leaflet**)  
✅ **Пожертвования** (в разработке)  

---

## **🚀 1. Установка и запуск**
### **📥 Клонируем репозиторий**
```bash
git clone https://github.com/your-repo/animal-shelter-backend.git
cd animal-shelter-backend
```

### **📦 Устанавливаем зависимости**
```bash
npm install
```

---

## **🛠 2. Настройка `.env`**
Создай файл **`.env`** в корне проекта и добавь туда:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/animal_shelter
JWT_SECRET=your_jwt_secret

# Cloudinary (для загрузки изображений)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
📌 **API-ключи Cloudinary можно получить в [Cloudinary Dashboard](https://cloudinary.com/console).**

---

## **🖥 3. Запуск сервера**
### **Запуск в режиме разработки**
```bash
npm run dev
```
(используется `nodemon` для автоматической перезагрузки)

### **Запуск в продакшн-режиме**
```bash
npm run build
npm start
```

---

## **📡 4. API Маршруты**
### **📌 Аутентификация**
- `POST /api/auth/register` – Регистрация пользователя (user/admin)
- `POST /api/auth/login` – Вход, получение JWT-токена

### **📌 Животные**
- `GET /api/animals` – Получить список животных (с фильтрацией)
- `POST /api/animals` – Добавить животное (**только админ**)
- `PUT /api/animals/:id` – Обновить данные животного (**только админ**)
- `DELETE /api/animals/:id` – Удалить животное (**только админ**)

### **📌 Приюты**
- `GET /api/shelters` – Получить список приютов
- `POST /api/shelters` – Создать приют (**только админ**)
- `PUT /api/shelters/:id` – Обновить приют (**только админ**)
- `DELETE /api/shelters/:id` – Удалить приют (**только админ**)

### **📌 Загрузка изображений**
- `POST /api/upload/cloudinary` – Загрузить фото в Cloudinary

### **📌 Объявления о потерянных и найденных животных**
- `POST /api/lost-found` – Добавить объявление
- `GET /api/lost-found` – Получить все объявления
- `GET /api/lost-found/lost` – Только потерянные животные
- `GET /api/lost-found/found` – Только найденные животные
- `DELETE /api/lost-found/:id` – Удалить объявление (**автор/админ**)

### **📌 QR-коды для животных**
- `GET /api/animals/:id/qrcode` – Получить QR-код животного

### **📌 Чаты (WebSocket)**
**(используется `ws` вместо `socket.io`)**  
**WebSocket URL:** `ws://localhost:5000`

- **Подключение к чату**
```json
{
    "type": "joinChat",
    "chatId": "650f34a2e4b0123456789abc"
}
```
- **Отправка сообщения**
```json
{
    "type": "sendMessage",
    "chatId": "650f34a2e4b0123456789abc",
    "sender": "650f1234a2e4b0123456789aa",
    "text": "Привет! Как дела?"
}
```

### **📌 Карта приютов**
📌 **Используется OpenStreetMap + Leaflet**  
**Координаты приютов хранятся в базе (широта/долгота).**  
📍 `GET /api/shelters` – Получить список приютов с координатами

---

## **✅ 5. Тестирование в Postman**
### **📍 1. Регистрация пользователя**
```
POST http://localhost:5000/api/auth/register
```
```json
{
  "name": "Иван",
  "email": "admin@example.com",
  "password": "password123",
  "phone": "+77001234567",
  "city": "Алматы",
  "role": "admin"
}
```

### **📍 2. Вход в аккаунт**
```
POST http://localhost:5000/api/auth/login
```
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
**Скопируй `token` из ответа.**

### **📍 3. Отправка защищенного запроса**
```
GET http://localhost:5000/api/animals
```
**Добавь в `Headers`:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### **📍 4. Подключение к WebSocket**
1. Открыть **Postman** → **WebSocket Request**
2. Ввести: `ws://localhost:5000`
3. Подключиться
4. Отправить:
```json
{
    "type": "joinChat",
    "chatId": "650f34a2e4b0123456789abc"
}
```

---

## **🛠 6. Дополнительные команды**
- **Пересборка TypeScript:**  
  ```bash
  npx tsc --build --force
  ```
- **Очистка зависимостей (если ошибки):**  
  ```bash
  rm -rf node_modules package-lock.json && npm install
  ```

---

## **🎯 Итог**
✅ **Полноценный бэкенд для мобильного приложения приюта животных.**  
✅ **REST API + WebSockets (чаты) + Cloudinary + OpenStreetMap.**  
✅ **Готово к интеграции с Flutter!** 🚀  

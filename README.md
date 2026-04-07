# Subscription Tracker Backend

Backend API for a subscription tracking application built with `Express`, `TypeScript`, `Sequelize`, and `MySQL`.

It provides:

- User authentication with access and refresh tokens
- Profile management and profile image upload
- Subscription CRUD operations
- Subscription calendar and renewal summaries
- Session tracking with a 2-device login limit

## Tech Stack

- Node.js
- Express 5
- TypeScript
- Sequelize
- MySQL
- JWT
- Cloudinary
- Multer
- Winston

## Project Structure

```text
src/
  config/         Database, logger, Cloudinary config
  controllers/    Route handlers
  middlewares/    Auth and upload middleware
  models/         Sequelize models
  routes/         Auth, user, and subscription routes
  types/          Shared request types
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Create a `.env` file in the project root:

```env
PORT=5000

DB_HOST=localhost
DB_NAME=subscription_tracker
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_A_SECRET=your_access_token_secret
JWT_R_SECRET=your_refresh_token_secret

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_KEY=your_cloudinary_api_key
CLOUD_SECRET=your_cloudinary_api_secret
```

## Running the Project

For local development:

```bash
npm run dev
```

Configured scripts:

- `npm run dev` starts the server with `nodemon`
- `npm start` runs `node ./src/server.ts`

## Authentication

Protected routes require this header:

```http
Authorization: Bearer <access_token>
```

Token behavior in the current codebase:

- Access token expiry: `15m`
- Refresh token expiry: `7d`
- Maximum active sessions per user: `2`

## API Base Paths

- `/auth`
- `/user`
- `/subscription`

## Auth Routes

### `POST /auth/register`

Create a new user.

Request body:

```json
{
  "name": "Sakthi",
  "email": "sakthi@example.com",
  "password": "strongPassword123",
  "timezone": "Asia/Kolkata"
}
```

### `POST /auth/login`

Log in and receive access and refresh tokens.

Request body:

```json
{
  "email": "sakthi@example.com",
  "password": "strongPassword123"
}
```

### `POST /auth/refresh`

Generate a new access token using a refresh token.

Request body:

```json
{
  "refreshToken": "your_refresh_token"
}
```

### `POST /auth/logout`

Invalidate a session by refresh token.

Request body:

```json
{
  "refreshToken": "your_refresh_token"
}
```

### `GET /auth/check`

Validate the current access token.

Requires authentication.

## User Routes

### `GET /user/profile`

Fetch the logged-in user profile.

Requires authentication.

### `PUT /user/updates/details`

Update profile information.

Requires authentication.

Request body:

```json
{
  "name": "Sakthi",
  "email": "sakthi@example.com",
  "timezone": "Asia/Kolkata",
  "currency": "INR"
}
```

### `PUT /user/updates/password`

Update account password.

Requires authentication.

Request body:

```json
{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

### `PUT /user/store/img`

Upload a profile image.

Requires authentication and `multipart/form-data`.

Form fields:

- `image`: image file
- `timezone`: optional timezone string

### `DELETE /user/delete`

Delete the logged-in user account.

Requires authentication.

## Subscription Routes

### `POST /subscription/create`

Create a subscription.

Requires authentication.

Request body:

```json
{
  "serviceName": "Netflix",
  "category": "Entertainment",
  "cost": 499,
  "status": "active",
  "startDate": "2026-04-01",
  "nextRenewal": "2026-05-01",
  "remindMeIn": 3,
  "billingCycle": "monthly",
  "paymentMethod": "Credit Card",
  "brandColorHex": "#E50914",
  "currency": "INR",
  "notes": "Family plan"
}
```

Required values are matched against lookup tables in the database for:

- `category`
- `currency`
- `billingCycle`
- `paymentMethod`
- `brandColorHex`

### `GET /subscription/:count`

Fetch subscriptions with pagination and filters.

Requires authentication.

Examples:

- `/subscription/all`
- `/subscription/10?page=1`

Supported query params:

- `page`
- `status=active|canceled`
- `category=<name>`
- `serviceName=<partial name>`

Response includes:

- `subscriptions`
- `pagination`
- `summary`

### `PUT /subscription/update/:id`

Update a subscription.

Requires authentication.

Uses the same request body shape as create.

### `PUT /subscription/status/:id`

Update only the subscription status.

Requires authentication.

Request body:

```json
{
  "status": "canceled"
}
```

### `DELETE /subscription/delete/:id`

Delete a subscription.

Requires authentication.

### `GET /subscription/calendar`

Fetch renewal data grouped by month for a specific year.

Requires authentication.

Supported query params:

- `year`
- `page`

Example:

```http
GET /subscription/calendar?year=2026&page=1
```

## Database Notes

This project expects a MySQL database and uses Sequelize models for:

- `users`
- `subscriptions`
- `login_logs`
- `categories`
- `currencies`
- `billing_cycles`
- `payment_methods`
- `brand_colors`

The subscription APIs depend on seeded lookup values in:

- `categories`
- `currencies`
- `billing_cycles`
- `payment_methods`
- `brand_colors`

## Important Implementation Notes

- CORS is enabled globally
- Request logging is handled with Winston
- Profile images are uploaded to Cloudinary
- Access tokens are verified using `JWT_A_SECRET`
- Refresh tokens are verified using `JWT_R_SECRET`
- Subscription monthly summaries currently use static currency conversion values defined in code

## Repository

- GitHub: `https://github.com/sakthivel-remitbee/subscription_tracker_backend`

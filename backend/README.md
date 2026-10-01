# Dish Management Backend

Modular Express.js & MongoDB backend featuring **Optimistic Concurrency Control (OCC)**, robust validation, and idempotent seeding.

---

## Architecture & Layered Structure

```
backend/
├── data/
│   └── seedDishes.json        # Default sample seed dataset
├── scripts/
│   ├── seed.js                # Idempotent database seeder
│   └── testEndpoints.js       # Comprehensive API verification test suite
├── src/
│   ├── controllers/
│   │   └── dishController.js  # Request handling & HTTP response mapping
│   ├── db/
│   │   └── connection.js      # MongoDB connection configuration
│   ├── middleware/
│   │   └── errorHandler.js    # Centralized error handling
│   ├── models/
│   │   └── Dish.js            # Mongoose schema & model definition
│   ├── repositories/
│   │   └── dishRepository.js  # Database access layer
│   ├── routes/
│   │   └── dishRoutes.js      # Express route definitions
│   ├── services/
│   │   └── dishService.js     # Concurrency logic & business rules
│   ├── validators/
│   │   └── dishValidator.js   # Type, URL, and publication rules validation
│   └── app.js                 # Express application setup
├── .env.example               # Example environment variables
├── package.json
└── server.js                  # Application entry point
```

---

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory (see `.env.example`):
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
```

### 3. Seed Database
The seeding script uses `$setOnInsert` upserts, ensuring it is **completely idempotent**: running it multiple times will never duplicate dishes or overwrite user edits:
```bash
npm run seed
```
You can also supply a custom JSON file path:
```bash
node scripts/seed.js /path/to/custom_dishes.json
```

### 4. Run the Server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

### 5. Run Automated Tests
```bash
npm run test:api
```

---

## API Endpoints

### 1. `GET /dishes`
Returns all dishes with their `dishId`, `dishName`, `imageUrl`, `isPublished`, and current `version`.

### 2. `GET /dishes/:dishId`
Returns a single dish by its `dishId`.

### 3. `PATCH /dishes/:dishId`
Safely updates a dish using Optimistic Concurrency Control.

#### Request Body
```json
{
  "dishName": "Paneer Butter Masala",
  "isPublished": true,
  "expectedVersion": 1
}
```

#### Status Codes:
- `200 OK`: Atomic update successful, returns the updated dish with incremented version.
- `400 Bad Request`: Validation failure (empty dishName when published, invalid HTTP/HTTPS image URL, missing fields, or incorrect field types).
- `404 Not Found`: Dish ID does not exist.
- `409 Conflict`: `expectedVersion` does not match the database version. Returns the current dish and version.

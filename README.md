# Nosh — Dish Management Dashboard

A full-stack dish management dashboard featuring **local draft editing**, **backend validation**, and **protection against conflicting updates** via **Optimistic Concurrency Control (OCC)**.

Built with **Next.js (App Router) + TypeScript + Redux Toolkit + Tailwind CSS + Tabler Icons** on the frontend, and **Node.js + Express.js + Mongoose (MongoDB)** on the backend.

---

## Table of Contents
1. [Architecture & Project Structure](#architecture--project-structure)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Installation & Setup](#installation--setup)
5. [Database Seeding (Idempotent)](#database-seeding-idempotent)
6. [Running the Application](#running-the-application)
7. [API Documentation & Examples](#api-documentation--examples)
8. [Required Acceptance Checks (Step-by-Step)](#required-acceptance-checks-step-by-step)
9. [Bonus Feature: External Updates (Live Sync)](#bonus-feature-external-updates-live-sync)
10. [Key Design Decision](#key-design-decision)
11. [Known Limitations](#known-limitations)
12. [Time Spent & AI Disclosure](#time-spent--ai-disclosure)

---

## Architecture & Project Structure

```
full stack intern/
├── backend/
│   ├── data/
│   │   └── seedDishes.json        # Seed data including valid & invalid test items
│   ├── scripts/
│   │   ├── seed.js                # Idempotent database seeder ($setOnInsert)
│   │   └── testEndpoints.js       # End-to-end API & concurrency test suite
│   ├── src/
│   │   ├── controllers/           # HTTP controllers (dishController.js)
│   │   ├── db/                    # Database connection (connection.js)
│   │   ├── middleware/            # Error handler (errorHandler.js)
│   │   ├── models/                # Mongoose schema (Dish.js)
│   │   ├── repositories/          # Data access layer (dishRepository.js)
│   │   ├── routes/                # Express routing (dishRoutes.js)
│   │   ├── services/              # Business rules & OCC logic (dishService.js)
│   │   ├── validators/            # Validation helpers & URL check (dishValidator.js)
│   │   └── app.js                 # Express app initialization
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Backend entry point
│
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router (layout.tsx, page.tsx, globals.css)
│   │   ├── components/
│   │   │   ├── dish/              # DishCard, DishGrid, ConflictModal, ImageWithFallback
│   │   │   ├── header/            # Navbar with search, filters & live sync toggle
│   │   │   └── sidebar/           # Dashboard sidebar navigation
│   │   ├── hooks/                 # useDishSync (5-second polling with cleanup)
│   │   ├── store/                 # Redux Toolkit store, hooks & dishSlice
│   │   └── types/                 # TypeScript interfaces (Dish, DishDraft)
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Prerequisites
* **Node.js**: v18.0.0 or higher (Tested on Node v22.12.0)
* **npm**: v9.0.0 or higher
* **MongoDB**: A running MongoDB instance or MongoDB Atlas URI

---

## Environment Configuration

### Backend (`backend/.env`):
Create a `backend/.env` file (reference `backend/.env.example`):
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
```

### Frontend (`frontend/.env.local`):
Create a `frontend/.env.local` file (reference `frontend/.env.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Installation & Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## Database Seeding (Idempotent)

From the `backend` directory:
```bash
cd backend
npm run seed
```
* **Idempotency Guarantee**: The seeder uses `$setOnInsert` with `upsert: true`. If run multiple times, it **never duplicates dishes or resets user edits/versions**.
* **Custom Seed File**: You can pass any custom JSON file path:
  ```bash
  node scripts/seed.js /path/to/custom_dishes.json
  ```

---

## Running the Application

### 1. Start the Backend Server (Port 3000)
```bash
cd backend
npm run dev
# Server will run at http://localhost:3000
```

### 2. Start the Frontend Application (Port 3001 or 3000)
In a separate terminal:
```bash
cd frontend
npm run dev
# Frontend will run at http://localhost:3000 or http://localhost:3001
```

### 3. Run Automated Backend Tests
Verifies all 7 required core backend behaviors (GET, PATCH, validation, 400, 404, 409 conflict, and version increments):
```bash
cd backend
npm run test:api
```

---

## API Documentation & Examples

### 1. `GET /dishes`
Returns all dishes with current publication status and version.

**Response `200 OK`**:
```json
{
  "success": true,
  "count": 7,
  "dishes": [
    {
      "dishId": "dish-001",
      "dishName": "Paneer Butter Masala",
      "imageUrl": "https://images.unsplash.com/...",
      "isPublished": true,
      "version": 1
    }
  ]
}
```

### 2. `PATCH /dishes/:dishId`
Safely updates a dish with explicit publication status and atomic version checking.

**Request Payload**:
```json
{
  "dishName": "Paneer Butter Masala",
  "isPublished": true,
  "expectedVersion": 1
}
```

**Responses**:
* **`200 OK`**: Successfully updated. Returns updated dish with incremented version (`version: 2`).
* **`400 Bad Request`**: Validation error (empty trimmed dish name when published, invalid HTTP/HTTPS URL when published, missing or invalid types).
* **`404 Not Found`**: `dishId` not found in database.
* **`409 Conflict`**: `expectedVersion` does not match the database version. Database is not modified. Returns:
  ```json
  {
    "error": "Conflict: Dish has been modified by another update",
    "currentDish": { ... },
    "currentVersion": 2
  }
  ```

---

## Required Acceptance Checks (Step-by-Step)

### Check 1: Reseeding Idempotency
1. Run `npm run seed` in `backend`. Dishes are inserted with `version: 1`.
2. Edit a dish in the dashboard (or via API) and save it (version increments to 2).
3. Run `npm run seed` again.
4. **Result**: The output confirms `0 newly inserted, 7 existing dishes preserved`. Stored edits and versions survive unchanged.

### Check 2: Local Draft Isolation & Persistence
1. Change the dish name in the dashboard input field. Do **not** click Save.
2. Note the amber **"Unsaved Draft"** badge and indicator.
3. Inspect MongoDB or refresh another tab: the database remains unchanged.
4. Click **Discard**: the local draft immediately reverts to the saved values.
5. Make an edit and click **Save**: the returned updated values and incremented version are displayed, and the unsaved indicator disappears.
6. Refresh the page or restart the backend: saved values persist.

### Check 3: Publication Validation
* **Empty Name Check**: Attempt to publish a dish with an empty or whitespace-only name (`"   "`).
  * **Result**: Backend rejects with `400 Bad Request: A published dish must have a non-empty name`. Stored data is untouched.
* **Invalid Image URL Check**: Dish `dish-007` in seed data has `imageUrl: "invalid-url-for-testing"` and `isPublished: false`. Attempting to switch it to published:
  * **Result**: Backend rejects with `400 Bad Request: Cannot publish dish: Dish image URL 'invalid-url-for-testing' is not a valid HTTP/HTTPS URL`.

### Check 4: Multi-Tab Concurrency Conflict (409)
1. Open the dashboard in **Tab A** and **Tab B** (same dish, e.g., `dish-001` at version 1).
2. In **Tab A**, change name to `"Paneer Tab A"` and click **Save**. Tab A succeeds and version becomes 2.
3. In **Tab B**, without refreshing, edit name to `"Paneer Tab B"` and click **Save** (Tab B still sends `expectedVersion: 1`).
4. **Result**:
   * Tab B receives a `409 Conflict`.
   * Tab B's draft is **preserved intact**.
   * A conflict resolution banner and modal appears with a side-by-side comparison.
   * Tab B provides a **"Reload Latest"** button with a warning that it discards the local draft.

### Check 5: Simulated Backend Failure
1. Stop the backend server (`Ctrl + C` in backend terminal).
2. In the dashboard, edit a dish and click **Save**.
3. **Result**:
   * The draft is preserved with user edits intact.
   * An error message (`Network error: Could not reach backend server`) is displayed.
   * Save button re-enables allowing the user to correct or retry once the backend is restarted.

---

## Bonus Feature: External Updates (Live Sync)

* **Implementation**: The dashboard includes background polling every 5 seconds (managed by `useDishSync`).
* **Behavior with Local Drafts**:
  * If an external API update occurs on a dish the user has **not** edited, the card silently updates to show the newest version.
  * If the user **has an unsaved draft** on that dish, the background sync **never overwrites their draft**. Instead, a blue notification badge appears: `Newer version v{X} available in DB!` with an optional reload button.
* **Cleanup & Disconnection**:
  * The polling interval timer is cleared on unmount.
  * Can be toggled on/off via the **"Sync Active / Paused"** button in the top navbar.
  * Temporary network errors during background polling are handled silently without disrupting active drafts.

---

## Key Design Decision

### Database-Level Atomic Optimistic Concurrency Control (OCC)
Instead of using application-level locks, in-memory flags, or a blind toggle (`!isPublished`), we implemented atomic OCC directly in the database update query:

```javascript
Dish.findOneAndUpdate(
  { dishId, version: expectedVersion },
  {
    $set: { dishName, isPublished },
    $inc: { version: 1 }
  },
  { new: true, runValidators: true }
);
```

**Why this was chosen:**
1. **Concurrency Safety**: In distributed or multi-instance Node environments, in-memory locks do not protect against race conditions. MongoDB's single-document atomicity guarantees that even with two simultaneous requests, exactly one will match `expectedVersion` and increment the version; the other will match zero documents and safely trigger a `409 Conflict`.
2. **Explicit Publication State**: Rather than a blind toggle, the client must explicitly submit the intended boolean state (`true` or `false`), preventing unintended flip-flopping if network packets arrive out of order.

---

## Known Limitations
* Image URL validation performs syntactic HTTP/HTTPS protocol and URL structural verification; it does not download or verify reachability of external image servers (as specified in assignment boundaries).
* Direct database updates bypassing the API will update stored data but will not trigger event-driven pushes until the 5-second polling cycle runs.

---

## Time Spent & AI Disclosure
* **Approximate Time Spent**: ~4 hours
* **AI Disclosure**: Antigravity AI was used as a pair programming assistant to scaffold boilerplate code, assist with typing, and assemble tests based on the PDF requirements. All business logic, concurrency control, and validation rules were designed and verified against the assignment criteria.

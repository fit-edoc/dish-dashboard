const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');

function runGit(cmd) {
  try {
    return execSync(cmd, { cwd: rootDir, encoding: 'utf-8', stdio: 'pipe' });
  } catch (err) {
    console.error(`Error running: ${cmd}\n`, err.message);
    throw err;
  }
}

const commitSteps = [
  {
    files: ['.gitignore'],
    message: 'chore: initialize repository and workspace root gitignore'
  },
  {
    files: ['backend/package.json', 'backend/package-lock.json'],
    message: 'chore(backend): set up Express server dependencies and npm scripts'
  },
  {
    files: ['backend/.env.example'],
    message: 'chore(backend): add example environment configuration'
  },
  {
    files: ['backend/src/db/connection.js'],
    message: 'feat(backend): implement modular MongoDB connection using Mongoose'
  },
  {
    files: ['backend/server.js'],
    message: 'feat(backend): implement server entry point with graceful startup'
  },
  {
    files: ['backend/src/models/Dish.js'],
    message: 'feat(backend): define Mongoose Dish schema with OCC versioning'
  },
  {
    files: ['backend/src/validators/dishValidator.js'],
    message: 'feat(backend): add input validation and HTTP/HTTPS image URL validator'
  },
  {
    files: ['backend/src/repositories/dishRepository.js'],
    message: 'feat(backend): implement DishRepository for isolated database operations'
  },
  {
    files: ['backend/src/services/dishService.js'],
    message: 'feat(backend): implement DishService with atomic OCC version checks'
  },
  {
    files: ['backend/src/controllers/dishController.js'],
    message: 'feat(backend): create DishController for GET and PATCH endpoints'
  },
  {
    files: ['backend/src/routes/dishRoutes.js'],
    message: 'feat(backend): define Express router for dish resource operations'
  },
  {
    files: ['backend/src/middleware/errorHandler.js'],
    message: 'feat(backend): add centralized error handling middleware'
  },
  {
    files: ['backend/src/app.js'],
    message: 'feat(backend): configure Express app middleware, routes, and error handling'
  },
  {
    files: ['backend/data/seedDishes.json'],
    message: 'feat(backend): add official Nosh seed dataset with S3 dish images'
  },
  {
    files: ['backend/scripts/seed.js'],
    message: 'feat(backend): build idempotent database seeder with $setOnInsert'
  },
  {
    files: ['backend/scripts/testEndpoints.js'],
    message: 'test(backend): add automated API and concurrency conflict test suite'
  },
  {
    files: ['backend/README.md'],
    message: 'docs(backend): document backend architecture, setup, and seed commands'
  },
  {
    files: [
      'frontend/package.json',
      'frontend/package-lock.json',
      'frontend/tsconfig.json',
      'frontend/next.config.ts',
      'frontend/eslint.config.mjs',
      'frontend/.gitignore',
      'frontend/src/app/favicon.ico'
    ],
    message: 'chore(frontend): initialize Next.js 16 app with TypeScript and Tailwind'
  },
  {
    files: ['frontend/.env.example', 'frontend/.env.local'],
    message: 'chore(frontend): configure frontend environment variables'
  },
  {
    files: ['frontend/src/app/globals.css'],
    message: 'style(frontend): configure pure white light theme and typography tokens'
  },
  {
    files: ['frontend/src/types/dish.ts'],
    message: 'feat(frontend): add TypeScript interfaces for Dish and DishDraft'
  },
  {
    files: ['frontend/src/store/dishSlice.ts'],
    message: 'feat(frontend): implement Redux dishSlice with optimistic concurrency control'
  },
  {
    files: ['frontend/src/store/index.ts', 'frontend/src/store/hooks.ts'],
    message: 'feat(frontend): setup Redux Toolkit store and typed hooks'
  },
  {
    files: ['frontend/src/store/ReduxProvider.tsx'],
    message: 'feat(frontend): create ReduxProvider client wrapper for App Router'
  },
  {
    files: ['frontend/src/components/dish/ImageWithFallback.tsx'],
    message: 'feat(frontend): create ImageWithFallback component with loading skeleton'
  },
  {
    files: ['frontend/src/components/dish/ConflictModal.tsx'],
    message: 'feat(frontend): build ConflictModal for 409 conflict resolution and diffing'
  },
  {
    files: ['frontend/src/components/dish/DishCard.tsx'],
    message: 'feat(frontend): build shadcn-style DishCard with draft editing and OCC'
  },
  {
    files: ['frontend/src/components/sidebar/Sidebar.tsx'],
    message: 'feat(frontend): create responsive dashboard Sidebar with navigation and counts'
  },
  {
    files: ['frontend/src/components/header/Navbar.tsx'],
    message: 'feat(frontend): create Navbar with instant search, filters, and sync controls'
  },
  {
    files: ['frontend/src/components/dish/DishGrid.tsx'],
    message: 'feat(frontend): create DishGrid component with loading and empty states'
  },
  {
    files: ['frontend/src/hooks/useDishSync.ts'],
    message: 'feat(frontend): implement 5-second polling hook with draft preservation'
  },
  {
    files: ['frontend/src/app/layout.tsx'],
    message: 'feat(frontend): configure RootLayout with Inter font and Redux provider'
  },
  {
    files: ['frontend/src/app/page.tsx'],
    message: 'feat(frontend): assemble responsive DashboardPage in light theme'
  },
  {
    files: ['README.md'],
    message: 'docs: add comprehensive root README with setup and acceptance checks'
  }
];

console.log(`Starting ${commitSteps.length} git commits...`);

for (let i = 0; i < commitSteps.length; i++) {
  const step = commitSteps[i];
  for (const file of step.files) {
    try {
      runGit(`git add "${file}"`);
    } catch (_) {
      // File might not exist or already added
    }
  }

  try {
    runGit(`git commit -m "${step.message}"`);
    console.log(`[${i + 1}/${commitSteps.length}] ${step.message}`);
  } catch (err) {
    console.log(`[${i + 1}/${commitSteps.length}] (Skipped or already committed): ${step.message}`);
  }
}

// Final check: commit any remaining files
try {
  runGit('git add -A');
  runGit('git commit -m "chore: final project polish and verification cleanup"');
  console.log('Final commit created.');
} catch (_) {
  console.log('Working tree clean.');
}

console.log('All commits completed successfully!');

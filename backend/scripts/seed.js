require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../src/db/connection');
const Dish = require('../src/models/Dish');

async function seedDatabase() {
  try {
    console.log('--- Dish Seeding Process Started ---');
    await connectDB();

    const isCleanMode = process.argv.includes('--clean');
    const customFilePath = process.argv.find(
      (arg) => arg.endsWith('.json') && !arg.startsWith('--')
    );

    const defaultSeedPath = path.resolve(__dirname, '../data/seedDishes.json');
    const filePath = customFilePath ? path.resolve(process.cwd(), customFilePath) : defaultSeedPath;

    if (!fs.existsSync(filePath)) {
      throw new Error(`Seed data file not found at: ${filePath}`);
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const dishes = JSON.parse(rawData);

    if (!Array.isArray(dishes)) {
      throw new Error('Seed file must contain an array of dish objects');
    }

    console.log(`Loaded ${dishes.length} dishes from: ${filePath}`);

    if (isCleanMode) {
      console.log('Clean mode (--clean) detected: Resetting dishes collection...');
      await Dish.deleteMany({});
      console.log('Collection cleared.');
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const item of dishes) {
      if (!item.dishId) {
        console.warn(`Skipping item without dishId: ${JSON.stringify(item)}`);
        continue;
      }

      // Idempotent upsert: only set values on insert ($setOnInsert)
      // Never overwrites existing user edits or resets version
      const result = await Dish.updateOne(
        { dishId: String(item.dishId) },
        {
          $setOnInsert: {
            dishId: String(item.dishId),
            dishName: item.dishName || 'Untitled Dish',
            imageUrl: item.imageUrl || '',
            isPublished: Boolean(item.isPublished),
            version: 1 // Initial version requirement
          }
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        insertedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`Seeding complete: ${insertedCount} newly inserted, ${skippedCount} existing dishes preserved.`);
    console.log('--- Dish Seeding Successful ---');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();

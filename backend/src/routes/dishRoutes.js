const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');

// GET /dishes - Fetch all dishes
router.get('/', (req, res, next) => dishController.getAllDishes(req, res, next));

// GET /dishes/:dishId - Fetch single dish by ID
router.get('/:dishId', (req, res, next) => dishController.getDishById(req, res, next));

// PATCH /dishes/:dishId - Safely update dish name & published status with OCC
router.patch('/:dishId', (req, res, next) => dishController.updateDish(req, res, next));

module.exports = router;

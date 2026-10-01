const dishService = require('../services/dishService');
const { validateDishUpdateInput } = require('../validators/dishValidator');

class DishController {
  /**
   * GET /dishes
   * Retrieve all dishes
   */
  async getAllDishes(req, res, next) {
    try {
      const dishes = await dishService.getAllDishes();
      return res.status(200).json({
        success: true,
        count: dishes.length,
        dishes
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /dishes/:dishId
   * Retrieve single dish by dishId
   */
  async getDishById(req, res, next) {
    try {
      const { dishId } = req.params;
      if (!dishId || typeof dishId !== 'string' || dishId.trim().length === 0) {
        return res.status(400).json({ error: 'Valid dishId is required' });
      }

      const dish = await dishService.getDishById(dishId.trim());
      if (!dish) {
        return res.status(404).json({ error: `Dish with ID '${dishId}' not found` });
      }

      return res.status(200).json({ success: true, dish });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /dishes/:dishId
   * Update dish name and published status safely with OCC
   */
  async updateDish(req, res, next) {
    try {
      const { dishId } = req.params;

      // Validate dish identifier parameter
      if (!dishId || typeof dishId !== 'string' || dishId.trim().length === 0) {
        return res.status(400).json({ error: 'Valid dishId parameter is required' });
      }

      // Validate request body
      const validation = validateDishUpdateInput(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Perform update with concurrency check
      const result = await dishService.updateDish(dishId.trim(), validation.data);

      if (result.status === 404) {
        return res.status(404).json({ error: result.error });
      }

      if (result.status === 400) {
        return res.status(400).json({ error: result.error });
      }

      if (result.status === 409) {
        return res.status(409).json({
          error: result.error,
          currentDish: result.currentDish,
          currentVersion: result.currentVersion
        });
      }

      return res.status(200).json({
        success: true,
        dish: result.dish
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DishController();

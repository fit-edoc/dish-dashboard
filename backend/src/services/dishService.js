const dishRepository = require('../repositories/dishRepository');
const { isValidHttpUrl } = require('../validators/dishValidator');

class DishService {
  /**
   * Fetch all dishes from database
   */
  async getAllDishes() {
    return await dishRepository.findAll();
  }

  /**
   * Fetch single dish by its unique dishId
   */
  async getDishById(dishId) {
    return await dishRepository.findByDishId(dishId);
  }

  /**
   * Safely update dish with atomic Optimistic Concurrency Control (OCC)
   * 
   * @param {string} dishId - Unique dish identifier
   * @param {Object} updateData - { dishName, isPublished, expectedVersion }
   * @returns {Object} Result object indicating success, conflict, not found, or validation failure
   */
  async updateDish(dishId, { dishName, isPublished, expectedVersion }) {
    // 1. Check if the dish exists
    const existingDish = await dishRepository.findByDishId(dishId);
    if (!existingDish) {
      return { status: 404, error: `Dish with ID '${dishId}' not found` };
    }

    // 2. Validate publication rules against existing dish data
    if (isPublished === true) {
      if (!isValidHttpUrl(existingDish.imageUrl)) {
        return {
          status: 400,
          error: `Cannot publish dish: Dish image URL '${existingDish.imageUrl}' is not a valid HTTP/HTTPS URL`
        };
      }
    }

    // 3. Atomic version check and update using Optimistic Concurrency Control
    // Only updates if version matches expectedVersion exactly
    const updatedDish = await dishRepository.updateWithVersionCheck(
      dishId,
      expectedVersion,
      { dishName, isPublished }
    );

    // 4. If update failed to match, a version conflict occurred
    if (!updatedDish) {
      const currentDish = await dishRepository.findByDishId(dishId);
      return {
        status: 409,
        error: 'Conflict: Dish has been modified by another update',
        currentDish,
        currentVersion: currentDish ? currentDish.version : null
      };
    }

    return {
      status: 200,
      dish: updatedDish
    };
  }
}

module.exports = new DishService();

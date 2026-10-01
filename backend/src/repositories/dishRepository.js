const Dish = require('../models/Dish');

class DishRepository {
  /**
   * Find all dishes
   */
  async findAll() {
    return await Dish.find({}).sort({ dishId: 1 }).lean();
  }

  /**
   * Find dish by dishId
   */
  async findByDishId(dishId) {
    return await Dish.findOne({ dishId }).lean();
  }

  /**
   * Atomically update dish if expectedVersion matches current version
   * Increments version by 1 on success
   */
  async updateWithVersionCheck(dishId, expectedVersion, updateFields) {
    return await Dish.findOneAndUpdate(
      { dishId, version: expectedVersion },
      {
        $set: updateFields,
        $inc: { version: 1 }
      },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new DishRepository();

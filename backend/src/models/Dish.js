const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    dishId: {
      type: String,
      required: [true, 'dishId is required'],
      unique: true,
      trim: true,
      index: true
    },
    dishName: {
      type: String,
      required: [true, 'dishName is required'],
      trim: true
    },
    imageUrl: {
      type: String,
      required: [true, 'imageUrl is required'],
      trim: true
    },
    isPublished: {
      type: Boolean,
      required: true,
      default: false
    },
    version: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'version must be at least 1']
    }
  },
  {
    timestamps: true,
    versionKey: false // We use our own explicit optimistic concurrency version field
  }
);

// Format output to return dish object cleanly
dishSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;

/**
 * Helper to validate HTTP/HTTPS URLs without requiring image downloads
 */
function isValidHttpUrl(urlStr) {
  if (typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Validate input for updating a dish
 * Accepts { dishName, isPublished, expectedVersion }
 */
function validateDishUpdateInput(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  const { dishName, isPublished, expectedVersion } = body;

  // Validate dishName
  if (dishName === undefined || dishName === null) {
    errors.push('dishName is required');
  } else if (typeof dishName !== 'string') {
    errors.push('dishName must be a string');
  }

  // Validate isPublished
  if (isPublished === undefined || isPublished === null) {
    errors.push('isPublished is required');
  } else if (typeof isPublished !== 'boolean') {
    errors.push('isPublished must be a boolean');
  }

  // Validate expectedVersion
  if (expectedVersion === undefined || expectedVersion === null) {
    errors.push('expectedVersion is required');
  } else if (typeof expectedVersion !== 'number' || !Number.isInteger(expectedVersion) || expectedVersion < 1) {
    errors.push('expectedVersion must be a positive integer (>= 1)');
  }

  // Publication business rules
  if (typeof dishName === 'string' && isPublished === true) {
    if (dishName.trim().length === 0) {
      errors.push('A published dish must have a non-empty name');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      dishName: typeof dishName === 'string' ? dishName.trim() : dishName,
      isPublished,
      expectedVersion
    }
  };
}

module.exports = {
  isValidHttpUrl,
  validateDishUpdateInput
};

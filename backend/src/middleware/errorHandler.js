/**
 * Centralized error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  // SyntaxError from invalid JSON payload in request
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ error: 'Validation failed', details: messages });
  }

  // Default server error
  return res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
}

module.exports = errorHandler;

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Mongoose duplicate key
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Duplicate field value entered' });
    }
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        return res.status(400).json({ message });
    }

    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;

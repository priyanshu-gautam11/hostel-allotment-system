// Runs only when no route above matched the request.
const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error); // hand the error to the error handler
};

export default notFound;
const validate = (schema, source = "body") => {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const errors = {};

            for (const issue of result.error.issues) {
                const field = issue.path.join(".") || source;

                // Keep only one clear message per field.
                if (!errors[field]) {
                    errors[field] = issue.message;
                }
            }

            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors,
            });
        }

        if (source === "body") {
            req.body = result.data;
        } else {
            // Express 5 req.query is read-only.
            req.validatedQuery = result.data;
        }

        next();
    };
};

export default validate;
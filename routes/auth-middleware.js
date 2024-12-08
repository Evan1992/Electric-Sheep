const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
    if (typeof req.cookies !== 'undefined') {
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(403).json({ error: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.ADMIN_SECURITY_KEY);
            req.user = decoded; // Attach user data to the request object
        } catch (err) {
            res.status(401).json({ error: 'Invalid or expired token' });
        }
    }
    next();
};

const isAdminRedirect = (req, res, next) => {
    if (typeof req.cookies !== 'undefined') {
        try {
            const token = req.cookies.auth_token;
            if (token) {
                jwt.verify(token, process.env.ADMIN_SECURITY_KEY);
                return res.redirect('/admin');
            }
        } catch (err) {
            // Do nothing
        }
    }
    next();
};

module.exports = { isAdmin, isAdminRedirect };
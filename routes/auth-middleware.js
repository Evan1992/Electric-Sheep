const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
    const token = req.cookies?.auth_token;
    if (!token) return res.redirect('/');
    try {
        req.user = jwt.verify(token, process.env.ADMIN_SECURITY_KEY);
        next();
    } catch (err) {
        res.redirect('/');
    }
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
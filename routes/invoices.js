
const ExpressError = require("../expressError");
const db = require("../db");
const express = require("express");
const router = new express.Router();

// Routes
router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, comp_code FROM invoices`);
        return res.json({ invoices: results.rows });
    } catch (error) {
        return next(error);        
    }
});

// export the router
module.exports = router;
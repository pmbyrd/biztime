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

router.get("/:id", async (req, res, next) => {
	try {
		const id = req.params.id;
		if (!id) {
			throw new ExpressError("Invoice id required", 400);
		}
		const results = await db.query(
			`SELECT id, amt, paid, add_date, paid_date FROM invoices WHERE id=$1`,
			[id]
		);
		if (!results.rows.length) {
			throw new ExpressError(`No invoice found with id: ${id}`, 404);
		}
		return res.json({ invoice: results.rows[0] });
	} catch (error) {
		return next(error);
	}
});

router.post("/", async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        if (!comp_code || !amt) {
            throw new ExpressError("Company code and amount required", 400);
        }
        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]
        );
        return res.status(201).json({ invoice: results.rows[0] });
        } catch (error) {
            return next(error);
        }
});

router.put("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const { amt } = req.body;
        if (!id || !amt) {
            throw new ExpressError("Invoice id and amount required", 400);
        }
        const results = await db.query(
            `UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, id]
        );
        if (!results.rows.length) {
            throw new ExpressError(`No invoice found with id: ${id}`, 404);
        }
        return res.json({ invoice: results.rows[0] });
    } catch (error) {
        return next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new ExpressError("Invoice id required", 404);
        }
        const results = await db.query(
            `DELETE FROM invoices WHERE id=$1 RETURNING id`,
            [id]
        );
        return res.json({ status: "deleted" });
        } catch (error) {
            return next(error);
        }
});

// export the router
module.exports = router;

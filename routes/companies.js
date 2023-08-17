// Imports
const ExpressError = require("../expressError");
const db = require("../db");
const express = require("express");
const router = new express.Router();

// Routes
router.get("/", async (req, res, next) => {
	try {
		const results = await db.query(`SELECT code, name FROM companies`);
		return res.json({ companies: results.rows });
	} catch (error) {
		return next(error);
	}
});

router.get("/:code", async (req, res, next) => {
	try {
		const code = req.params.code;
		if (!code) {
			throw new ExpressError("Company code required", 400);
		}
		// if the code can not be found in the database, throw an error 404
		const results = await db.query(
			`SELECT code, name, description FROM companies WHERE code=$1`,
			[code]
		);
		if (!results.rows.length) {
			throw new ExpressError(`No company found with code: ${code}`, 404);
		}
		return res.json({ company: results.rows[0] });
	} catch (error) {
		return next(error);
	}
});

router.post("/", async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        if (!code || !name || !description) {
            throw new ExpressError("Code, name, and description required", 400);
        }
        const results = await db.query(
            `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
            [code, name, description]
        );
        return res.status(201).json({ company: results.rows[0] });
    } catch (error) {
        return next(error);
    }
});

router.put("/:code", async (req, res, next) => {
    try {
        // code is the param or in this instance the primary key
        const code = req.params.code;
        const { name, description } = req.body;  //What is being updated since the primary key can not be changed
        if (!code || !name || !description) {
            throw new ExpressError("Code, name, and description required", 400);
        }
        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
            [name, description, code]
        );
        if (!results.rows.length) {
            throw new ExpressError(`No company found with code: ${code}`, 404);
        }
        return res.json({ company: results.rows[0] });
    } catch (error) {
        return next(error);
    }   
});

router.delete("/:code", async (req, res, next) => {
    try {
        const code = req.params.code;
        if (!code) {
            throw new ExpressError("Company code required", 400);
        }
        const results = await db.query(
            `DELETE FROM companies WHERE code=$1 RETURNING code`,
            [code]
        );
        if (!results.rows.length) {
            throw new ExpressError(`No company found with code: ${code}`, 404);
        }
        return res.json({ status: "deleted" });
    } catch (error) {
        return next(error);
    }
});

// Make sure to export
module.exports = router;

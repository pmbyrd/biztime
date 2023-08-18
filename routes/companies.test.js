process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;

beforeEach(async () => {
    const result = await db.query(
        `INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple', 'A fruit, computers and phones.') RETURNING code, name, description`);
    testCompany = result.rows[0];
    });

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
    });

afterAll(async () => {
    await db.end();
    });

describe("GET /companies", () => {
    test("Get a list with one company", async () => {
        const res = await request(app).get(`/companies`);
        expect(res.statusCode).toBe(200);
        expect(res.body.companies[0].code).toBe('apple');
        expect(res.body.companies[0].name).toBe('Apple');
        });
    });

describe("GET /companies/:code", () => {
    test("Get a single company", async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.company.code).toBe(testCompany.code);
        expect(res.body.company.name).toBe(testCompany.name);
        expect(res.body.company.description).toBe(testCompany.description);
        });
    })
    // make test for 404 error
    test("Responds with 500 if can't find company", async () => {
        const res = await request(app).get(`/companies/0`);
        expect(res.statusCode).toBe(500);
        });

describe("POST /companies", () => {
    test("Create a new company", async () => {
        const res = await request(app)
            .post(`/companies`)
            .send({code: 'google', name: 'Google', description: 'Search engine'});
        expect(res.statusCode).toBe(201);
        expect(res.body.company.code).toBe('google');
        expect(res.body.company.name).toBe('Google');
        expect(res.body.company.description).toBe('Search engine');
        });
    });
    test("Responds with 400 if missing data", async () => {
        const res = await request(app)
            .post(`/companies`)
            .send({code: 'google'});
        expect(res.statusCode).toBe(400);
        });

describe("PUT /companies/:code", () => {
    test("Update a single company", async () => {
        const res = await request(app)
            .put(`/companies/${testCompany.code}`)
            .send({name: 'Google', description: 'Search engine'});
        expect(res.statusCode).toBe(200);
        expect(res.body.company.code).toBe(testCompany.code);
        expect(res.body.company.name).toBe('Google');
        expect(res.body.company.description).toBe('Search engine');
        });
    });
    test("Responds with 400 if can't find company", async () => {
        const res = await request(app).put(`/companies/0`);
        expect(res.statusCode).toBe(400);
        });

describe("DELETE /companies/:code", () => {
    test("Delete a single company", async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" });
        });
    test("Responds with 404 if can't find company", async () => {
        const res = await request(app).delete(`/companies/0`);
        expect(res.statusCode).toBe(404);
        });
    });
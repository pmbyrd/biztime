
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
    testResults = await db.query(`
        SELECT id, comp_code, amt, paid, add_date, paid_date
        FROM invoices
    `);
});

afterAll(async () => {
    await db.end();
    });
    
describe('GET /invoices', () => {
    test('Get a list with all invoices', async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoices: testResults.rows });
    });
});

describe('GET /:id', () => {
    test('Get a single invoice', async () => {
        const response = await request(app).get("/invoices/1");
    expect(response.body).toEqual(
        {
          "invoice": {
            id: 1,
            amt: 100,
            add_date: '2018-01-01T08:00:00.000Z',
            paid: false,
            paid_date: null,
            company: {
              code: 'apple',
              name: 'Apple',
              description: 'Maker of OSX.',
            }
            }
        }
    );
    });
});

describe('POST /', () => {
    test('Create a new invoice', async () => {
        const res = await request(app)
            .post('/invoices')
            .send({ comp_code: 'apple', amt: 1000 });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: 'apple',
                amt: 1000,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
            }
        });
    });
});

describe('PUT /:id', () => {
    test('Update an invoice', async () => {
        const res = await request(app)
            .put('/invoices/1')
            .send({ amt: 500 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: {
                id: 1,
                comp_code: 'apple',
                amt: 500,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
            }
        });
    });
});

describe('DELETE /:id', () => {
    test('Delete an invoice', async () => {
        const res = await request(app).delete('/invoices/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: 'deleted' });
    });
});
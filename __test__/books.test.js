process.env.NODE_ENV = "test"

const request = require("supertest");


const app = require("../app");
const db = require("../db");

let book_isbn;

beforeEach(async () => {
    let result = await db.query(`
      INSERT INTO
        books (isbn, amazon_url,author,language,pages,publisher,title,year)
        VALUES(
          '12',
          'https://a.co/d/bY7tYQY',
          'Robert Kirkman',
          'English',
          100,
          'Skybound Entertainment',
          'Invincible', 2011)
        RETURNING isbn`);
  
    book_isbn = result.rows[0].isbn
});
  
describe("POST /books", function () {
    test("Creates a new book", async function () {
      const response = await request(app)
          .post(`/books`)
          .send({
            isbn: '32',
            amazon_url: "https://a.co/d/bN61Szl",
            author: "Anthony Weston",
            language: "english",
            pages: 1000,
            publisher: "Math People",
            title: "A Rulebook for Arguments",
            year: 2023
          });
      expect(response.statusCode).toBe(201);
      expect(response.body.book).toHaveProperty("isbn");
    });
    test("Prevents creating book without required title", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({year: 2000});
        expect(response.statusCode).toBe(400);
    });
});

describe("GET /books/:isbn", function () {
    test("Gets a single book", async function () {
      const response = await request(app)
          .get(`/books/${book_isbn}`)
      expect(response.body.book).toHaveProperty("isbn");
      expect(response.body.book.isbn).toBe(book_isbn);
    });
  
    test("Responds with 404 if can't find book in question", async function () {
      const response = await request(app)
          .get(`/books/91`)
      expect(response.statusCode).toBe(404);
    });
});

describe("PUT /books/:id", function () {
    test("Updates a single book", async function () {
      const response = await request(app)
          .put(`/books/${book_isbn}`)
          .send({
            amazon_url: "https://a.co/d/bN61Szl",
            author: "Anthony Weston",
            language: "english",
            pages: 10000,
            publisher: "Math People",
            title: "A Rulebook for Arguments",
            year: 2023
          });
      expect(response.body.book.pages).toBe(10000);
    });
  
    test("Prevents a bad book update", async function () {
      const response = await request(app)
          .put(`/books/${book_isbn}`)
          .send({
            isbn: "41414141",
            author: "michael",
            amazon_url: "https://google.com",
          });
      expect(response.statusCode).toBe(400);
    });
  
    test("Responds 404 if can't find book in question", async function () {
      // delete book first
      await request(app)
          .delete(`/books/${book_isbn}`)
      const response = await request(app).delete(`/books/${book_isbn}`);
      expect(response.statusCode).toBe(404);
    });
});

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
});


afterAll(async function () {
    await db.end()
});
  
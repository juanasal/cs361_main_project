const request = require("supertest");
const app = require("./server");

describe("Password Microservice API Tests", () => {

  test("GET / should return health status", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBeDefined();
  });

  test("POST /generate-password returns password", async () => {
    const res = await request(app)
      .post("/generate-password")
      .send({
        length: 12,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.password).toBeDefined();
    expect(res.body.password.length).toBe(12);
  });

  test("POST rejects invalid length", async () => {
    const res = await request(app)
      .post("/generate-password")
      .send({
        length: 2,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("POST rejects when no character types selected", async () => {
    const res = await request(app)
      .post("/generate-password")
      .send({
        length: 10,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("Generated password respects options (numbers-only check)", async () => {
    const res = await request(app)
      .post("/generate-password")
      .send({
        length: 10,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: true,
        includeSymbols: false
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.password).toMatch(/^[0-9]+$/);
  });

});

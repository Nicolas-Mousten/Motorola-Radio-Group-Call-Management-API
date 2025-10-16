import request from 'supertest';
import express from 'express';
import floorRouter from '../routes/floor.js';

const app = express();
app.use(express.json());
app.use("/groups", floorRouter);

describe("Floor API", () => {
  it("should allow a user to obtain the floor", async () => {
    const res = await request(app)
      .post('/groups/group1/floor')
      .send({ userId: "user1", priority: 1 });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Floor obtained by user1/);
  });

  it("should prevent a lower priority user from taking the floor", async () => {
    // First, user1 gets the floor
    await request(app).post('/groups/group1/floor').send({ userId: "user1", priority: 2 });

    const res = await request(app)
      .post('/groups/group1/floor')
      .send({ userId: "user2", priority: 1 }); // lower priority

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/Floor is currently held by user1/);
  });

  it("should allow a higher priority user to preempt the floor", async () => {
    await request(app).post('/groups/group1/floor').send({ userId: "user1", priority: 1 });

    const res = await request(app)
      .post('/groups/group1/floor')
      .send({ userId: "user2", priority: 5 }); // higher priority

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Floor preempted/);
  });

  it("should return the current occupant", async () => {
    await request(app).post('/groups/group2/floor').send({ userId: "user3" });

    const res = await request(app).get('/groups/group2/floor/occupant');
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe("user3");
  });

  it("should release the floor", async () => {
    await request(app).post('/groups/group2/floor').send({ userId: "user3" });
    const res = await request(app).delete('/groups/group2/floor/user3');

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Floor released by user3/);
  });

  it("should return 404 for unoccupied floor", async () => {
    const res = await request(app).get('/groups/group3/floor/occupant');
    expect(res.status).toBe(404);
  });
  
});
import { ServiceUnavailableException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("liveness never touches the database", () => {
    const db = { query: jest.fn() };
    const controller = new HealthController(db as unknown as DataSource);
    expect(controller.getHealth()).toEqual({ status: "ok" });
    expect(db.query).not.toHaveBeenCalled();
  });

  it("readiness is ok when the database answers", async () => {
    const db = { query: jest.fn().mockResolvedValue([{ "?column?": 1 }]) };
    const controller = new HealthController(db as unknown as DataSource);
    await expect(controller.readiness()).resolves.toEqual({ status: "ok" });
  });

  it("readiness fails with 503 when the database is down", async () => {
    const db = { query: jest.fn().mockRejectedValue(new Error("connection refused")) };
    const controller = new HealthController(db as unknown as DataSource);
    await expect(controller.readiness()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

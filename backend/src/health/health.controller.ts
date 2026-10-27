import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

type Status = { status: "ok" };

// Readiness rule A3: liveness says the process is alive (no dependency checks,
// or a database outage would restart every pod); readiness says it can serve.
@Controller("health")
export class HealthController {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  @Get()
  getHealth(): Status {
    return { status: "ok" };
  }

  @Get("readiness")
  async readiness(): Promise<Status> {
    try {
      await this.db.query("SELECT 1");
    } catch {
      throw new ServiceUnavailableException("database unreachable");
    }
    return { status: "ok" };
  }
}

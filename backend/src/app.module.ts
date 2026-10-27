import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSourceOptions } from "./data-source";
import { HealthModule } from "./health/health.module";
import { TodosModule } from "./todos/todos.module";

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), HealthModule, TodosModule]
})
export class AppModule {}

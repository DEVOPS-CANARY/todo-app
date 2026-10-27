import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { InitialSchema1761500000000 } from "./migrations/1761500000000-InitialSchema";
import { Todo } from "./todos/todo.entity";

// One connection description for the app and for the migration Job. Compiled to
// dist/data-source.js, so migrations run from the image with plain node:
//   node node_modules/typeorm/cli.js migration:run -d dist/data-source.js
// Entities and migrations are imported explicitly (no globs): the list is the
// same under ts-jest, in the nest build output and for the TypeORM CLI.
export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [Todo],
  migrations: [InitialSchema1761500000000],
  // The schema only changes through migrations (readiness rule A9).
  synchronize: false,
  logging: process.env.DB_LOGGING === "true"
};

export default new DataSource(dataSourceOptions);

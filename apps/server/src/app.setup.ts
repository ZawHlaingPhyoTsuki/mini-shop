import { INestApplication, StandardSchemaValidationPipe } from "@nestjs/common";

/**
 * Shared application setup used by both the production bootstrap
 * (`main.ts`) and the end-to-end tests, so both exercise the same
 * pipes and CORS behavior.
 */
export function setupApp(app: INestApplication) {
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  return app;
}

import "varlock/auto-load";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";
import { setupApp } from "./app.setup.js";
import { ENV } from "./env.server.js";
import { parseCorsOrigins } from "./utils/cors.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });
  // Behind Azure App Service TLS is terminated at the proxy: without this
  // Express sees plain HTTP and Better Auth won't emit Secure cookies.
  app.getHttpAdapter().getInstance().set("trust proxy", 1);
  app.enableShutdownHooks();
  setupApp(app);

  // Parse CORS origins from comma-separated string
  const allowedOrigins = parseCorsOrigins(ENV.CORS_ORIGIN);

  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("TCL Guide API")
    .setDescription("Local discovery platform for Tachileik, Myanmar")
    .setVersion("1.0")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, documentFactory);

  await app.listen(3000);
}
await bootstrap();

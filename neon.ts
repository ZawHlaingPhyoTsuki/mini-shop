import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  buckets: {
    "tcl-guide-images": { access: "public_read" },
  },
});

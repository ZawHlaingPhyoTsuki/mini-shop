import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  auth: false,
  buckets: {
    // Product images are public once uploaded. Drafts stay private by only
    // being linked from an unpublished product.
    assets: { access: "public_read" },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (branch.name === "dev") {
      // Shared development/preview branch: no TTL, so it stays until deleted.
      return {};
    }
    if (!branch.exists) {
      // Short-lived feature branches: auto-expire.
      // Run `neon checkout <name>` to create a new branch with these settings.
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});

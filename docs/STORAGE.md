# Product Image Storage

## 1. Purpose

Store product images and shop logos/banners in Neon S3-compatible object storage. Postgres stores metadata and object keys, not image binary data.

## 2. Upload flow

The implementation follows the same pattern as `tcl-guide`: the AWS SDK talks
directly to Neon Object Storage, and the browser uploads with a short-lived
presigned `PUT` URL.

1. Merchant selects an image in the dashboard.
2. Browser sends the content type and size to the server.
3. Server verifies the session and permission to manage the target shop/product.
4. Server validates the declared type and size, then generates the object key.
5. Server returns a presigned `PUT` URL valid for five minutes.
6. Browser uploads the image directly to `AWS_ENDPOINT_URL_S3`.
7. Browser calls the completion endpoint with the generated key.
8. Server verifies the object exists, matches the expected type and size, and
   persists the key and metadata.
9. Product publication references only validated, authorized images.

Object keys are always generated on the server. Clients never choose a bucket
or an object key.

## 3. Object key convention

Use generated, non-user-controlled keys, for example:

```text
shops/{shopId}/products/{productId}/{randomObjectId}
shops/{shopId}/branding/{randomObjectId}
```

Do not use an original filename as the sole object key. Preserve a sanitized display filename only if needed for metadata.

## 4. Database metadata

A product image record may contain:

- `id`
- `productId`
- `objectKey`
- `contentType`
- `sizeBytes`
- `width` and `height` (optional)
- `altText`
- `sortOrder`
- timestamps

Store stable object keys rather than expiring presigned URLs. Images live in the `public_read` `assets` bucket, so URLs are derived directly from the object key.

## 5. Validation

- Allow only required image formats (for example JPEG, PNG, and WebP).
- Enforce a maximum size and reasonable dimensions.
- Do not trust the file extension or browser MIME type alone.
- Ensure the uploader has permission to attach the object.
- Prevent one merchant from referencing another merchant's private objects.
- Consider image re-encoding to normalize content and remove unnecessary metadata.
- Clean up failed or abandoned uploads with a safe cleanup process.

## 6. Public access decision

The `assets` bucket is configured as `public_read` in `neon.ts`. Public URLs are
derived directly from the bucket endpoint:

```text
{AWS_ENDPOINT_URL_S3}/{NEON_BUCKET_NAME}/{objectKey}
```

Uploads are still authorized and presigned on the server. Draft and
moderation-hidden content stays out of public discovery by application rules;
if stricter per-object access becomes necessary, switch to signed reads or a
controlled media endpoint.

Never assume bucket defaults: verify the provider's current behavior and
configure it explicitly.

## 7. Environment configuration

Keep credentials server-only. The app uses these settings:

- `AWS_ENDPOINT_URL_S3`
- `NEON_BUCKET_NAME` (defaults to `assets`)
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Use the exact names and requirements documented by the chosen Neon storage
product and the current application environment setup. Do not expose secret
values through Vite-prefixed public variables or browser code.

# Deployment Lockdown Checklist (Free Tier)

Use this checklist before going live.

## 1) Secrets and environment

- Set `NODE_ENV=production`.
- Set `APP_URL` to your real frontend domain(s), comma-separated.
- Set `ALLOW_REQUESTS_WITHOUT_ORIGIN=false`.
- Set `ALLOW_LEGACY_ADMIN_PASSWORD=false`.
- Set `ADMIN_PASSWORD_HASH` and leave `ADMIN_PASSWORD` empty.
- Set a long random `JWT_SECRET` (32+ chars).
- Set all `VITE_FIREBASE_*` keys.
- Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## 2) Firebase (Spark plan compatible)

- Enable Google provider in Firebase Auth.
- Add production domain to Firebase Authorized domains.
- Add localhost only for development.
- In Firebase console, set strict rules for any enabled products (Storage/Firestore) if used.

## 3) Database (Neon free tier)

- Keep pooled connection string with SSL enabled.
- Restrict DB user privileges to app schema only when possible.
- Enable Neon branch backups/checkpoints (free features where available).

## 4) Cloudinary (free tier)

- Use unsigned uploads only from server side (already done).
- Rotate API key/secret if ever exposed.
- Keep upload size limit low (already restricted).

## 5) Deployment/runtime

- Deploy one backend instance first (rate limiter is in-memory).
- Enable HTTPS only (most free hosts do this by default).
- Keep logs enabled and monitor auth/upload failures.

## 6) Post-deploy smoke checks

- Login/signup/local auth works.
- Google auth popup works on production domain.
- Admin login works only with hashed password.
- Upload endpoint works and rejects invalid file signatures.
- Wishlist routes work for authenticated users.

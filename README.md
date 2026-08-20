# BloodLink Backend

Backend API for the BloodLink blood management system.

## Structure

- `config`: database configuration
- `controllers`: request handlers
- `middleware`: reusable Express middleware
- `models`: Mongoose models
- `routes`: API route definitions
- `services`: business logic
- `utils`: shared helpers and constants
- `uploads`: uploaded files

## MongoDB collections

- `loginaccounts`: private authentication records containing the phone number,
  role, and one-way bcrypt `passwordHash`. Plain-text passwords are never saved.
- `donors`: donor profiles and the fields used to build donor cards.
- `requesters`: requester and patient profile information.
- `bloodrequests`: active and historical blood requests.
- `registrationhistories`: registration audit records linked to an account and
  its role-specific profile.
- `loginhistories`: successful and failed login events. The
  `passwordVerified` field records the result without storing the submitted
  password.
- `donationhistories`: completed donation records.

Authentication data and public profile data are deliberately separated. API
responses never return `passwordHash`, although the secure hash remains visible
to authorized database administrators in the `loginaccounts` collection.

## Existing database migration

Run the following command once after deploying the separated collection model:

```powershell
npm run migrate:profiles
```

The migration is idempotent, preserves existing MongoDB `_id` values, and keeps
the legacy `users` collection as a safety backup. Verify login and registration
before manually archiving or deleting that backup.

Verify the separated collection counts and confirm that every login account has
a password hash without printing any credential values:

```powershell
npm run verify:db-structure
```

## Render deployment

The included `render.yaml` configures the Node service, start command, and a
database-aware health check. In Render, choose **New > Blueprint**, connect this
repository, and supply these environment variables when prompted:

```text
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<a long random secret>
NODE_ENV=production
CLIENT_ORIGIN=https://<your-frontend-domain>
```

`CLIENT_ORIGIN` must match the deployed frontend origin exactly and must not
include a trailing slash. Multiple frontend origins can be comma-separated.
In MongoDB Atlas, allow Render's outbound connection (commonly `0.0.0.0/0` in
Network Access) and keep the database username/password restricted and secret.

Do not manually set `PORT`; Render supplies it. `CLIENT_ORIGIN` must match the
deployed Vercel origin exactly and must not include a trailing slash. Multiple
origins can be comma-separated, for example the production domain and a specific
preview domain.

After Render deploys, verify:

```text
https://<your-render-service>.onrender.com/api/health
```

It returns HTTP 200 only when both Express and MongoDB are ready. Then set this on
Vercel and redeploy the frontend:

```text
VITE_API_URL=https://<your-render-service>.onrender.com
```

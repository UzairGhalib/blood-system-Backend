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

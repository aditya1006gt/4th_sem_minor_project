# Environment File Summary

This file documents the values currently defined in [`.env`](/c:/Users/user/OneDrive/Desktop/4th%20Sem%20Minor%20Project/backend/.env).

## Variables

| Variable | Current Value | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | Port used by the backend server. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/smart-college-platform` | Local MongoDB connection string for the application's database. |
| `JWT_SECRET` | `replace_with_a_long_secure_secret` | Secret key used to sign JWT tokens. This is currently a placeholder and should be replaced in real use. |
| `JWT_EXPIRES_IN` | `7d` | JWT token validity period. |
| `CLIENT_URL` | `http://localhost:3000` | Frontend URL allowed to communicate with the backend. |

## Notes

- The setup is configured for local development.
- MongoDB is expected to run on `127.0.0.1:27017`.
- `JWT_SECRET` should be changed to a strong private value before deployment.

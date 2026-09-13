# Namecheap Deployment

This project can run on Namecheap as a full Next.js website with PostgreSQL-backed bookings, reviews, and contact messages.

## Fastest setup

Use a Namecheap hosting plan that includes:

- `Setup Node.js App` in cPanel
- PostgreSQL databases
- SSL support

## Files you need

- Project files from this repo
- [`server.js`](/Users/surft/Desktop/Sites/moving-service-website-development/server.js)
- [`database/namecheap-bootstrap.sql`](/Users/surft/Desktop/Sites/moving-service-website-development/database/namecheap-bootstrap.sql)
- [`.env.namecheap.example`](/Users/surft/Desktop/Sites/moving-service-website-development/.env.namecheap.example)

## cPanel steps

1. Upload the project to a folder outside `public_html`.
2. Extract the uploaded archive.
3. Create a PostgreSQL database and user in cPanel.
4. Import [`database/namecheap-bootstrap.sql`](/Users/surft/Desktop/Sites/moving-service-website-development/database/namecheap-bootstrap.sql) into that database.
5. Open `Setup Node.js App` in cPanel and create an app with:
   - Node.js version: `22.x`
   - Mode: `Production`
   - Application root: the uploaded project folder
   - Application URL: `surftmove.ca`
   - Startup file: `server.js`
6. Add the environment variables from [`.env.namecheap.example`](/Users/surft/Desktop/Sites/moving-service-website-development/.env.namecheap.example), replacing placeholders with the real values.
7. Run `npm install`.
8. Run `npm run build`.
9. Start or restart the Node.js app.

## Required environment variables

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `NOTIFY_EMAIL`

## Optional environment variables

- `NEXT_PUBLIC_GTM_ID`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

## Notes

- The website will still work if Twilio is not configured, but SMS confirmation will stay disabled.
- The inbound mail webhook at `/api/resend/inbound` still depends on Resend.
- If you want a fully local mailbox on Namecheap, you can create `info@surftmove.ca` there separately, but transactional sending in the app is currently wired to Resend for reliability.

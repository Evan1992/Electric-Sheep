# Electric Sheep — Design Document

## Overview

Electric Sheep is a personal catalogue web app for tracking and organizing media — books, dramas, records, games, channels, software, and podcasts. It supports one admin account for writing/editing, while visitors can browse publicly.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js 4.19.2 |
| Database | MongoDB Atlas via Mongoose 8.7.2 |
| Templating | EJS (server-side rendered) |
| Frontend | Bootstrap 4.1.3 + custom CSS |
| Auth | JWT (jsonwebtoken) + bcrypt |
| File Uploads | Multer 1.4.2 |
| HTTP Client | request 2.88.2 |
| Dev | nodemon, dotenv |

---

## Architecture

### Admin vs. Visitor Separation

There is a single admin account. The same content is shown differently depending on authentication state:
- Public routes: `/` → `index.ejs`
- Admin routes: `/admin` → `index-admin.ejs`
- The same pattern applies to all item pages (book, drama, etc.)

Admin login issues a **JWT stored in an HttpOnly cookie** (24h expiry). All write operations (create, edit, delete) are protected by the `auth-middleware.js` JWT verifier.

Key reason for cookies over localStorage: `localStorage` is browser-only and inaccessible in Express middleware (server-side). Cookies travel with requests and are readable via `req.cookies`.

### Request Flow

```
Browser → Express router → auth-middleware (JWT check) → controller logic → MongoDB → EJS render → Response
```

---

## Directory Structure

```
Electric-Sheep/
├── app.js                  # Entry point, DB connection, middleware setup
├── .env                    # Secrets (DATABASE_NAME, ADMIN_SECURITY_KEY)
├── models/                 # Mongoose schemas
│   ├── book.js
│   ├── drama.js
│   ├── record.js
│   ├── game.js
│   ├── channel.js
│   ├── software.js
│   ├── podcast.js
│   ├── admin.js            # Bcrypt-hashed credentials
│   └── logs.js             # IP-based visitor tracking
├── routes/
│   ├── index.js            # Auth routes + home/admin pages
│   ├── item.js             # Generic CRUD for all item types (~730 lines)
│   ├── bucket-list.js      # Bucket list page
│   └── auth-middleware.js  # JWT verification middleware
├── services/
│   └── doubanClient.js     # Fetches cover images from the local DoubanScraper service
├── views/                  # EJS templates per item type
│   ├── shared/commentary/  # Reusable commentary templates
│   └── {book,drama,record,game,channel,software,bucket-list}/
├── public/
│   ├── stylesheets/        # CSS
│   └── pictures/           # Static images
├── scripts/                # Client-side JS
│   ├── adminLogin.js
│   ├── adminLogout.js
│   ├── weather.js
│   ├── dropDownSelect.js
│   ├── rate.js
│   ├── visits.js
│   └── getServerIP.js
└── uploads/                # Temporary Multer upload staging dir
```

---

## Data Models

| Model | Key Fields |
|---|---|
| Book | ISBN, author, publisher, year, reading status, star rating, excerpts, commentaries |
| Drama | Director, genres, watched status, memorable lines, commentaries |
| Record | Artist, genre, medium, ownership status, rating |
| Game | Developer, genre, played status, rating |
| Channel | Platform, genres, watched status, commentaries |
| Software | Company, founders, platforms, year, rating |
| Podcast | Host, listened status, rating |
| Admin | Username, bcrypt-hashed password, role |
| Log | IP address, visit count |

---

## API Routes

### Authentication
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/login` | Public | Issue JWT cookie |
| POST | `/logout` | Public | Clear auth cookie |

### Pages
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Home with visitor analytics |
| GET | `/admin` | Admin | Admin dashboard |

### Item CRUD (applies to all item types)
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/{item}/new` | Admin | Create form |
| POST | `/{item}/new` | Admin | Save new item + image upload |
| GET | `/{item}/index` | Public | List all items |
| GET | `/{item}/:id/show` | Public | Item detail |
| GET | `/{item}/:id/edit` | Admin | Edit form |
| PUT | `/{item}/:id` | Admin | Update item |
| DELETE | `/{item}/:id` | Admin | Delete item |

### Commentary (Books, Dramas, Channels)
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/{item}/:id/commentary/new` | Public | Commentary form |
| PUT | `/{item}/:id/commentary/new` | Public | Submit commentary |
| GET | `/{item}/:id/commentary/:cId` | Public | View commentary |
| PUT | `/{item}/:id/commentary/:cId/edit` | Admin | Edit commentary |
| DELETE | `/{item}/:id/commentary/:cId` | Admin | Delete commentary |

Note: PUT/DELETE are tunneled through POST via `method-override` since HTML forms only support GET/POST.

---

## Image Handling

- **Upload**: Multer intercepts multipart form data and writes the file to `uploads/` with a hex-hash filename.
- **Storage**: The file is read from disk, encoded, and stored as binary data directly in MongoDB.
- **Serving**: Images are rendered as base64 data URIs in EJS templates — the app never serves files from `uploads/` directly.
- **Known issue**: Multer temp files in `uploads/` are **never cleaned up** after being stored in the database — they accumulate indefinitely.

### Auto Image Fetch via DoubanScraper microservice

When creating a new drama without a manually uploaded cover, the app automatically fetches one from Douban via a local microservice ([DoubanScraper](https://github.com/Evan1992/DoubanScraper)).

**Flow:**
1. `POST /drama/new` — if no file uploaded, calls `services/doubanClient.js`
2. `fetchCover(name)` posts `{ name }` to the DoubanScraper at `http://127.0.0.1:8000/crawl`
3. Scraper returns an image URL + required `Referer` header
4. Node fetches the image bytes with `Referer` + a browser `User-Agent` (required — Douban CDN blocks default Node agent)
5. Buffer is stored in MongoDB identically to a manual upload

**Key gotchas:**
- Use `127.0.0.1` not `localhost` — Node 18+ resolves `localhost` to `::1` (IPv6) but the scraper listens on IPv4 only, causing `ECONNREFUSED`
- Douban's CDN requires a `User-Agent` mimicking a real browser, otherwise the image fetch fails silently
- The DoubanScraper must be running locally before this works; if it's down, the drama is created without a cover (error is caught and logged)

---

## Authentication Design

JWT is stored as an HttpOnly cookie (not localStorage) so it travels automatically with requests and is accessible in Express middleware via `req.cookies.auth_token`.

HTML `<a>` tags cannot send custom headers, so admin navigation uses JavaScript `fetch()` calls that attach the `Authorization: Bearer <token>` header, then write the returned HTML to the document.

---

## Visitor Analytics

- `logs.js` model records IP addresses and visit counts
- IP is captured via `request-ip` middleware
- Displayed on the home page as a visitor counter

---

## Deployment

### Current: AWS Elastic Beanstalk + CodePipeline
- Express app runs on an EC2 instance behind an Application Load Balancer
- CodePipeline triggers auto-deploy on every GitHub push (via OAuth webhook)
- MongoDB Atlas network access opened to `0.0.0.0/0` to allow EB connections

### Why Not AWS Amplify
Amplify is optimized for front-end/serverless apps. It expects a `build` script and a `dist/` artifact directory, neither of which applies to an Express server.

### HTTPS
AWS Certificate Manager (ACM) does **not** issue certificates for default `*.elasticbeanstalk.com` domains — a custom domain is required. Until then, geolocation and other secure-only browser APIs (like the weather widget) will fail in production with `Only secure origins are allowed`.

### Lessons from Deployment Errors
| Error | Cause | Fix |
|---|---|---|
| `Artifact directory doesn't exist: dist` | Amplify expects front-end build output | Switch to Elastic Beanstalk |
| `MongooseServerSelectionError` | MongoDB Atlas IP whitelist | Allow `0.0.0.0/0` in Atlas Network Access |
| CSS `ERR_CONNECTION_TIMED_OUT` | Incorrect static file path | Fix `__dirname`-relative path in app.js |
| `ERR_CONNECTION_REFUSED` on home | CSP `upgrade-insecure-requests` meta tag forcing HTTPS | Remove the meta tag |
| `401` on admin login (prod only) | Admin user not found in prod DB | Seed admin user in prod MongoDB |
| CloudWatch log streaming failure | EC2 instance role missing `logs:CreateLogStream` + `s3:PutObject` | Add permissions to IAM role |

---

## Known Issues & Technical Debt

1. **Multer temp file accumulation** — files in `uploads/` are never deleted after DB storage
2. **No HTTPS** — weather API and geolocation broken in production until a custom domain + ACM cert is set up
3. **Admin seeding** — prod database requires manual admin user creation; there is no seed script
4. **Single admin account** — no multi-user or role hierarchy support
5. **Large route file** — `routes/item.js` is ~730 lines handling all item types; could be split per type

---

## Planned Features

- Data extraction / scraping
- Visitor tracking improvements
- Message board
- Location API integration
- Multi-language support
- Extend auto image fetch to books, records, games, channels (currently drama only)

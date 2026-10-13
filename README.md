## dropbin : A Next.js + PostgreSQL (Drizzle ORM) + Cloudflare R2 based Ephemeral Pastebin & File Sharing Platform

Welcome to **dropbin**, a modern, high-performance ephemeral pastebin and direct-to-storage file sharing platform built with Next.js 16, React 19, Drizzle ORM, PostgreSQL, and Cloudflare R2. Designed for speed, privacy, zero-knowledge temporary storage, and auto-expiring links.

![HeroSectionImage](public/image.png)

### Features :

- **Instant Ephemeral Text & Secret Notes**: Client-side buffer editor with live character/line counters, UTF-8 badge, and quick clipboard pasting.
- **Direct-to-Cloudflare R2 Object Storage**: Two-phase presigned PUT uploads bypassing server bandwidth and payload bottlenecks for files, media, and images (up to 100 MB).
- **Custom Vanity Slugs & PRNG Fallback**: Create memorable custom aliases (`/my-custom-slug`) or rely on a cryptographic 56-character alphabet PRNG generator with built-in collision retries.
- **Flexible Expiration Engine**: Automatic self-destruction with selectable TTL windows (10 minutes, 30 minutes, 1 hour, 6 hours, 1 day, 7 days).
- **View Limits & Burn-on-Read**: Enforce maximum view counts or activate self-destructing burn-on-read drops (destroys upon first access).
- **Lazy Cookie Sessions**: Zero-waterfall session management provisioning user UUIDs only upon drop creation without upfront page load friction.
- **Local Drop History & Tracker**: Automatic browser `localStorage` management tracking your created drops, live countdowns, copy actions, and deletion controls.
- **Aesthetic Forest & Lime Typography**: Custom palette featuring Instrument Serif headings, Aspekta sans, and deep pine dark mode.

### Contributors

<a href="https://github.com/Devnish0/dropbin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Devnish0/dropbin" />
</a>

### Tech Stack

**Frontend:**

- **Next.js 16** - React framework with App Router & Turbopack
- **React 19** - Modern UI library with concurrent features
- **TypeScript** - Strict end-to-end type safety
- **Tailwind CSS 4** - Modern CSS framework with `@theme inline` variables
- **Lucide React & Tabler Icons** - Crisp, modern SVG iconography
- **Base UI & shadcn/ui** - Accessible, unstyled UI primitives
- **Instrument Serif & Aspekta** - Distinctive typography system

**Backend & Storage:**

- **PostgreSQL** - Relational database for metadata, sessions, and TTL indexing
- **Drizzle ORM** - TypeScript ORM with type-safe schema definitions and zero overhead
- **Cloudflare R2** - S3-compatible global object storage with zero egress fees
- **AWS S3 SDK (`@aws-sdk/client-s3`)** - Presigned PUT and GET URL generation
- **Zod 4** - Strict runtime schema validation for API routes and upload contracts
- **Docker Compose** - Local containerized PostgreSQL environment

**Development Tools:**

- **Bun** - Ultra-fast JavaScript runtime and package manager
- **Drizzle Kit** - Database migrations and prototyping studio
- **ESLint** - Code quality and standards enforcement

---

## Contributing & Installation

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Devnish0/dropbin.git
   cd dropbin
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment Setup**

   Create a `.env` or `.env.local` file in the root directory:

   ```env
   # Database (PostgreSQL)
   DATABASE_URL="postgres://postgres:postgres@localhost:5432/dropbin_db"

   # Cloudflare R2 Credentials
   R2_ACCOUNT_ID="your_cloudflare_account_id"
   R2_ACCESS_KEY_ID="your_r2_access_key_id"
   R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
   R2_BUCKET_NAME="dropbin"

   # Public App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Start PostgreSQL Container**

   ```bash
   docker compose up -d
   ```

5. **Push Database Schema**

   ```bash
   bun x drizzle-kit push
   ```

6. **Start Development Server**

   ```bash
   bun dev
   # or
   npm run dev
   ```

7. **Access App**

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Folder Structure

```
dropbin/
├── docker-compose.yml            # Local PostgreSQL Docker configuration
├── drizzle.config.ts             # Drizzle Kit configuration
├── learning/                     # Architectural decision logs & autopsy records
│   ├── concepts.md               # Durable distributed systems & Next.js concepts
│   └── mistakes.md               # Debugging autopsies and prevention patterns
├── public/                       # Static public assets
│   ├── font/                     # Instrument Serif & Aspekta web fonts
│   ├── favicon.ico               # Multi-size Dropbin icon
│   ├── favicon.svg               # Vector favicon
│   └── image.png                 # Hero preview screenshot
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [code]/               # Dynamic drop viewer & download page
│   │   │   └── page.tsx
│   │   ├── api/                  # Server-side API endpoints
│   │   │   ├── drop/             # Drop creation & code retrieval API
│   │   │   │   ├── [code]/route.ts
│   │   │   │   └── route.ts
│   │   │   └── upload/           # Presigned R2 authorization API
│   │   │       └── presigned-url/route.ts
│   │   ├── favicon.ico           # App root favicon
│   │   ├── globals.css           # Tailwind CSS 4 theme & color tokens
│   │   ├── icon.svg              # App router vector icon
│   │   ├── layout.tsx            # Root HTML layout & metadata
│   │   └── page.tsx              # Main Dropbin creation workspace
│   ├── components/               # React UI components
│   │   ├── CopyButton.tsx        # Clipboard copy button with animated feedback
│   │   ├── DropSettings.tsx      # Expiration, custom code & view limit selectors
│   │   ├── DropSuccessModal.tsx  # Shareable link preview & security badges
│   │   ├── DropTypeToggle.tsx    # Text vs. Files pill switcher
│   │   ├── FileDropzone.tsx      # Drag-and-drop file uploader with preview
│   │   ├── PasteEditor.tsx       # Monospace paste editor with live counters
│   │   ├── RecentDrops.tsx       # LocalStorage drop history & countdowns
│   │   └── ui/                   # Reusable UI primitives
│   ├── db/                       # Database schema & client
│   │   ├── index.ts              # PostgreSQL connection pool singleton
│   │   └── schema.ts             # Drizzle schema (users & drops tables)
│   └── lib/                      # Core business logic & services
│       ├── code.ts               # Cryptographic PRNG & slug validator
│       ├── drops.ts              # Drop creation, lookup & view tracking service
│       ├── expiry.ts             # TTL duration calculations & mapping
│       ├── r2.ts                 # Cloudflare R2 client & presigned URL helpers
│       ├── session.ts            # Lazy cookie provisioning engine
│       ├── utils.ts              # ClassName merging utilities
│       └── validations/          # Zod input validation schemas
│           ├── drop.ts           # Drop creation schemas
│           └── upload.ts         # Presigned upload URL request schemas
```

---

### Naming Conventions

**Files & Folders:**

- Use `kebab-case` for folder names and non-component utility files (e.g., `presigned-url`, `session.ts`, `drops.ts`).
- Component files use `PascalCase` (e.g., `PasteEditor.tsx`, `DropSettings.tsx`, `RecentDrops.tsx`).
- API routes live in dedicated directories with `route.ts`.
- Validation schemas use descriptive suffixes (e.g., `drop.ts`, `upload.ts`).

**Components:**

- React components use `PascalCase`.
- Component props interfaces end with `Props` (e.g., `PasteEditorProps`, `DropSettingsProps`).
- Custom hooks start with `use` prefix (e.g., `useDropHistory`).

**Database & API:**

- Database tables and relations use `snake_case` in PostgreSQL, exposed as `camelCase` in Drizzle (e.g., `textContent`, `expiresAt`, `maxViews`).
- API endpoints follow RESTful conventions (`POST /api/drop`, `GET /api/drop/[code]`).
- Request schemas end with `Schema` (e.g., `createFileDropSchema`, `createTextDropSchema`).

**Variables & Functions:**

- Use `camelCase` for functions and variables (`createFileDrop`, `formatRemainingTime`).
- Constants use `UPPER_SNAKE_CASE` (e.g., `R2_BUCKET_NAME`, `EXPIRY_DURATIONS`).
- Boolean state variables start with `is`, `has`, `can`, `should` (e.g., `isLoading`, `isExpired`).

---

### Contribution

1. **Fork the repository** and clone your fork:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. **Follow the coding standards**:
   - Use strict TypeScript for all new code.
   - Preserve zero-leakage ephemeral storage patterns.
   - Maintain client-side error boundaries and loading indicators.
3. **Database Changes**:
   - Update `src/db/schema.ts` and test with `bun x drizzle-kit push`.
4. **Testing & Verification**:
   - Verify zero type errors: `bun x tsc --noEmit`.
   - Verify build: `bun run build`.
   - Test both Text and File drops through local Cloudflare R2 and PostgreSQL instances.
5. **Commit Guidelines**:
   - Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
   - Write clear, descriptive commit messages.
6. **Submit a Pull Request**:
   - Describe changes clearly and include screenshots for UI updates.

# RSVP Manager - Frontend

Next.js frontend application for secure event RSVP management with comprehensive validation and security features.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **React:** 19

## Quick Start

```bash
npm install
npm run dev
```

Configure `.env.local` with API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3013/api
```

## Design Decisions

### Security Architecture

**Content Security Policy (CSP):**
- Restricts resource loading to prevent XSS
- `default-src 'self'` - Only load from same origin
- `script-src` - Allows Next.js required scripts
- `connect-src` - Restricts API calls to allowed origins
- `frame-ancestors 'none'` - Prevents clickjacking
- Environment-aware (stricter in production)

**Security Headers:**
- `X-Frame-Options: DENY` - Prevents all framing
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Strict-Transport-Security` - Enforces HTTPS
- `X-XSS-Protection` - Browser XSS filter
- `Referrer-Policy` - Controls referrer information

**Input Validation:**
- Inline validation (no browser default validation)
- Real-time error feedback
- Validation on blur and submit
- Client-side sanitization before API calls
- Character limits enforced (name: 100, email: 200)

### User Experience

**Form Validation:**
- Free typing allowed (no restrictions while typing)
- Validation errors shown after blur or submit
- Character counter for visual feedback
- Enter key submits form if both fields filled
- Error messages clear when user starts typing

**Token Management:**
- Tokens stored in localStorage per RSVP
- Copy cancellation link functionality
- Manual token entry removed (URL-only)
- Secure token handling

## Security Implementation

### Input Sanitization

**Validation Utility (`lib/validation.ts`):**
- Removes dangerous characters: `< > " ' &`
- Removes script tags and dangerous protocols
- Name: 2-100 chars, letters/spaces/hyphens/apostrophes only
- Email: Max 200 chars, valid format, no XSS patterns

**Sanitization Flow:**
1. User types → No restrictions
2. On blur → Validate and show errors
3. On submit → Sanitize → Validate → Send to API
4. API receives → Additional sanitization on backend

### XSS Protection

**Multiple Layers:**
- Input sanitization removes dangerous patterns
- React automatically escapes output
- CSP headers prevent script execution
- No `dangerouslySetInnerHTML` usage
- All user input sanitized before rendering

### API Security

**Request Security:**
- Tokens sent in Authorization header
- No tokens in URL parameters (except cancel page)
- CORS configured on backend
- Rate limiting handled by backend

## Features

### RSVP Form
- Name input (max 100 characters)
- Email input (max 200 characters)
- Inline validation with error messages
- Character counters
- Enter key submission
- Loading states

### RSVP List
- Display all attendees
- Copy cancellation link button
- Cancel RSVP button (only for own RSVP)
- Real-time updates after mutations
- Loading and error states

### Cancel Page
- Token verification from URL
- RSVP details display
- Confirmation modal
- Success/error handling
- Auto-redirect after cancellation

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx         # Main RSVP page
│   ├── cancel/
│   │   └── page.tsx     # Cancellation page
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Global styles
├── components/
│   ├── RSVPForm.tsx     # RSVP creation form
│   ├── RSVPList.tsx     # Attendees list
│   ├── ConfirmModal.tsx # Confirmation dialogs
│   └── Toast.tsx        # Toast notifications
├── contexts/
│   └── ToastContext.tsx # Toast state management
├── lib/
│   ├── api.ts           # API client
│   └── validation.ts    # Input validation utilities
├── types/
│   └── index.ts         # TypeScript types
└── .env.local           # Environment variables
```

## Security Features

### Client-Side Protection

**Input Validation:**
- Real-time validation feedback
- Pattern matching for name/email
- Length restrictions enforced
- Dangerous character removal

**XSS Prevention:**
- All user input sanitized
- React automatic escaping
- CSP headers block unauthorized scripts
- No eval() or innerHTML usage

**Token Security:**
- Tokens stored in localStorage
- Never exposed in URLs (except cancel page)
- Sent only in Authorization headers
- Automatic cleanup on cancellation

### Security Headers

All security headers configured in `next.config.ts`:
- CSP with environment-aware policies
- X-Frame-Options: DENY
- HSTS for HTTPS enforcement
- Content-Type-Options
- XSS-Protection

## API Integration

**API Client (`lib/api.ts`):**
- Centralized API calls
- Error handling
- Token management
- Type-safe requests/responses

**Endpoints Used:**
- `POST /api/rsvps` - Create RSVP
- `GET /api/rsvps` - Get all RSVPs
- `DELETE /api/rsvps/:id` - Cancel RSVP
- `GET /api/rsvps/verify-token` - Verify token
- `DELETE /api/rsvps/cancel-by-token` - Cancel by token

## Production Considerations

- Update CSP `connect-src` with production API URL
- Remove `unsafe-eval` from CSP in production
- Enable `upgrade-insecure-requests` in CSP
- Configure production domain in CORS
- Use environment variables for API URL
- Enable Next.js production optimizations
- Set up error tracking (Sentry)
- Monitor CSP violations
- Use CDN for static assets

## License

MIT

# RSVP Manager - Frontend

Next.js frontend application for event RSVP management with pagination, validation, and security features.

## Summary & Design Assumptions

**System Requirements:**
- **1+ Million Users:** Handles millions of concurrent RSVPs
- **Heavy Read Traffic:** 95%+ reads (viewing lists, checking status)
- **Burst Write Traffic:** 10k-100k RSVPs in minutes when event opens
- **High Consistency:** RSVP count and page 1 must be immediately consistent
- **Low Latency:** Sub-100ms response times for cached reads
- **High Availability:** 99.9%+ uptime

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS

**Quick Start:**
```bash
npm install
npm run dev
```

Configure `.env.local` with `NEXT_PUBLIC_API_URL` pointing to backend API.

## Caching Strategy

**Frontend Integration with Backend Caching:**

**Key Design:**
- **Pagination:** Fetches 20 items per page (configurable, max 100)
- **Cache-Aware:** Leverages backend atomic counter and page caching
- **Real-time Updates:** Page 1 refreshes immediately after create/delete
- **Optimistic UI:** Shows loading states during API calls

**Flow:**
- **Read:** Fetch paginated data → Display with pagination controls → Cache in component state
- **Write:** Submit form → Show loading → Update local state → Refresh page 1
- **Result:** Fast page loads, immediate feedback, seamless pagination

**Why This Works:**
- Backend atomic counter provides instant count (<1ms)
- Backend page caching reduces API response time
- Page 1 invalidation ensures fresh data after writes
- Pagination prevents loading millions of records

## Security

**Multi-Layer Protection:**
- **Input Validation:** Client-side validation before submission
- **XSS Prevention:** Sanitizes inputs, removes dangerous characters
- **CSP Headers:** Content Security Policy restricts resource loading
- **Token Security:** JWT tokens stored in localStorage, sent in Authorization header
- **Security Headers:** X-Frame-Options: DENY, HSTS, CORS

**Validation Rules:**
- Name: 2-100 chars, letters/spaces/hyphens/apostrophes only
- Email: Max 200 chars, standard format validation
- No special characters like `< >` in name field
- Real-time validation on blur, prevents invalid submissions

## Components

**Core Components:**

**RSVPForm:**
- Form for creating new RSVPs
- Inline validation (name, email)
- Character count display
- Enter key submission
- Error handling and toast notifications

**RSVPList:**
- Displays paginated RSVP list
- Shows total count
- Copy cancellation link button
- Cancel RSVP functionality
- Loading and error states

**Pagination:**
- Page navigation with ellipsis
- Previous/Next buttons
- Current page highlighting
- Responsive design

**Toast:**
- Success/error notifications
- Auto-dismiss after 3 seconds
- Multiple toast support

**ConfirmModal:**
- Confirmation dialogs
- Loading states
- Customizable messages

## Architecture & Flow

**Request Flow:**

**Create RSVP:**
1. User fills form (name, email)
2. Client-side validation
3. Submit to `POST /api/rsvps`
4. Receive token, store in localStorage
5. Refresh RSVP list (page 1)
6. Show success toast

**View RSVPs:**
1. Fetch `GET /api/rsvps?page=1&limit=20`
2. Display paginated list
3. Show total count from backend
4. Render pagination controls
5. Handle page navigation

**Delete RSVP:**
1. Click cancel button
2. Show confirmation modal
3. Get token from localStorage
4. Call `DELETE /api/rsvps/:id`
5. Refresh list (adjust page if needed)
6. Show success toast

**API Integration:**
- `createRSVP(name, email)` - Create new RSVP
- `getRSVPs(page, limit)` - Get paginated RSVPs
- `deleteRSVP(id, token)` - Delete RSVP
- `verifyRSVPToken(token)` - Verify cancellation token
- `cancelRSVPByToken(token)` - Cancel via token

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3013/api
```

## Production Considerations

- Configure production API URL
- Enable CSP headers (already configured)
- Optimize bundle size (Next.js automatic)
- Enable image optimization
- Configure CDN for static assets
- Monitor API response times
- Handle network errors gracefully
- Implement retry logic for failed requests

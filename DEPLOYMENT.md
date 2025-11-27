# Production Deployment Checklist

To deploy FuelMap VIC to production (e.g. Vercel), follow these steps:

## 1. Environment Variables
Do not commit the API key to Git. Instead, configure it in your hosting provider.

**Vercel:**
1. Go to Project Settings > Environment Variables.
2. Add `SERVO_SAVER_API_KEY` with your value: `eddc3a2f08837eb30c8066977ae8ece6`
3. Add `NEXT_PUBLIC_BASE_URL` if needed (usually Vercel handles this).

## 2. API Endpoint Verification
The current implementation attempts to guess the endpoint. You **must** verify the exact URL from the official PDF documentation you received.
- If the PDF says `GET /fuel/stations`, update `app/api/prices/route.ts` line 116.
- If the PDF says `GET /fuel/prices`, update accordingly.

## 3. Analytics
Add an analytics provider to track usage.
- **Vercel Analytics** (easiest)
- **Google Analytics**

## 4. Metadata & SEO
Update `app/layout.tsx` and `app/page.tsx` with:
- Real `title` and `description`.
- Open Graph images (for social sharing).
- `<link rel="canonical" ... />`

## 5. Legal
- Add a "Terms of Use" and "Privacy Policy" link in the footer.
- Attribution: You must include "Data provided by Service Victoria" in your footer or about page as per their terms.

## 6. Performance
- Run `npm run build` locally to ensure no errors.
- Test LightHouse score.

## 7. Domain
- Buy a domain (e.g. `fuelmapvic.com.au`).
- Connect it in Vercel.


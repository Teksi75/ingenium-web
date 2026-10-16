# Help search engines and AI identify Ingenium

The official website is **https://ingenium-web.vercel.app** (confirmed by the owner). This first AEO/GEO improvement aligns technical identity signals; it does not guarantee indexing, citations or recommendations.

## What this change covers

- One public origin in `lib/site.ts` for canonical metadata, social previews, JSON-LD, robots and sitemap.
- A local description based on existing public services and the published Vistalba, Mendoza address.
- The existing social image (`public/og-image.png`) instead of `/og.jpg` on another domain. Image dimensions are omitted rather than assumed.
- An identifiable `EducationalOrganization` with stable ID `https://ingenium-web.vercel.app/#organization`, published contact, explicitly mapped postal address (country `AR`), Instagram and Google Maps references. Inline JSON escapes `<`. No invented ratings, affiliations, schedules or prices.
- Existing unrestricted public crawling remains unchanged. Search crawling and model-training crawling are different uses; this change does not alter the existing training-crawler policy.
- No generated sitemap modification date: deployment time is not evidence that content changed.

## Verify locally

Use pnpm, the project's chosen package manager. Run `pnpm exec node --test tests/seo.test.mjs`. There is no `test:seo` package script. The tests start a local Next.js development server, inspect public HTML and metadata routes, and stop the server afterward. To inspect an already running production server instead, set `SEO_TEST_URL` to its local URL before running the same command. Use `pnpm build` for production-build validation; `pnpm lint` is a separate code-quality check.

The focused tests cover canonical/social metadata and image availability, structured identity, the preserved public robots policy, and the single homepage sitemap without a synthetic modification date. Runtime tests and a production build must be checked after implementation; this document does not claim they have passed.

## Owner actions after an approved deployment

1. Verify the official URL in Google Search Console and Bing Webmaster Tools, submit `/sitemap.xml`, and inspect homepage indexing.
2. Check that Vercel access protection or firewall rules do not block public search crawlers. A permissive robots file alone cannot prove access.
3. Keep the Google Business Profile name, address, phone and website consistent with the website. Update the profile only with owner-approved information.
4. Review visible service descriptions and questions families actually ask. The later-confirmed ETEC and UTN/UNCuyo Mathematics and Physics offers need a separate visible-content update, not hidden schema-only claims.
5. Record an initial baseline and periodically check indexed pages, search impressions, citations and attributable inquiries. Recommendations vary by query, location and engine; do not treat one generated answer as proof of ranking.

Publishing, account configuration and these external checks are not performed by this change. No `llms.txt`, keyword stuffing, hidden instructions, fabricated reviews or special AI endorsement markup is required or added.

## Sources

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features): ordinary search eligibility applies; no additional technical requirements or special AI schema.
- [OpenAI: crawler overview](https://platform.openai.com/docs/bots): `OAI-SearchBot` supports search discovery; `GPTBot` concerns model training.
- [Next.js: metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata): canonical and social URL composition.

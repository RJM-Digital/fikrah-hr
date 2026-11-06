# Fikrah HR

## Cookie consent and Google Tag Manager

The local [cookie banner](src/components/Cookie.js) uses `CookieConsent=true` or
`CookieConsent=false`, retained for 365 days. Accept and Decline update Google
Consent Mode v2 and Microsoft Clarity consent without reloading. The labelled
Manage cookies button reopens the banner without changing the saved choice.
The existing Fikrah cookie-policy URL is retained.

### WordPress configuration

The WordPress component with slug `google-tag-manager` is the configuration source.
Set its `enableGtm`, `headScript` and `bodyScript` fields using the snippets from
**Fikrah's own GTM container**. Both snippets must contain exactly one matching
`GTM-...` container ID.

[gatsby-node.js](gatsby-node.js) fetches this component from `WPGRAPHQL_URL`, falling
back to `https://fikrah-hr.rjmdigital.net/graphql`. Only the validated container ID
is compiled into the site; supplied JavaScript/HTML is not executed. Missing or
invalid configuration and fetch failures produce a build warning and disable GTM.
Explicitly disabling the component also removes GTM output.

**Rebuild and deploy after changing the WordPress GTM component.** No GTM-specific
hosting environment variable is needed. Inspect build warnings before releasing.

[gatsby-ssr.js](gatsby-ssr.js) sets `analytics_storage`, `ad_storage`, `ad_user_data`
and `ad_personalization` to denied before loading GTM, restores saved acceptance
before the loader, and queues Clarity `consentv2`. The canonical GTM `noscript`
fallback is placed directly at the start of the body.

### Required customer GTM configuration

Coordinate the website release with these container changes. Website consent
defaults alone do **not** prevent analytics requests from incorrectly configured
tags. GTM itself loads before acceptance; analytics tags must be blocked by consent.

1. Export the existing Fikrah container as a backup. Merge the agency container
   template from Import Template Coach into the customer workspace, never overwrite
   it. Keep Fikrah's customer container and measurement IDs, not the agency master
   container or placeholder values. Reconcile existing tags to avoid duplicates.
2. Set the GA4 Measurement ID constant. Require additional `analytics_storage`
   consent on both the Google tag and the GA4 page-view event tag.
3. Fire the Google tag on Initialization and `cookie_consent_granted`, with
   `send_page_view=false`. Fire the explicit `page_view` event on
   `cookie_consent_granted` and `gatsby-route-change`.
4. Configure data-layer variables for `page_location`, `page_path` and `page_title`
   and pass them to the page-view event. Review existing automatic/history-based
   page views, including GA4 enhanced measurement, to prevent duplicate SPA events.
5. If using Clarity, use its official GTM community template and Fikrah's project
   ID. Require additional `analytics_storage`, fire on Initialization and
   `cookie_consent_granted`, and turn off cookies by default in Clarity settings.
   Do not add a second automatic Clarity installation.
6. Review consent requirements on all retained customer tags. Do not add a separate
   GTM Consent Initialization tag; the website owns the pre-loader default.

[gatsby-browser.js](gatsby-browser.js) emits `gatsby-route-change` on Gatsby route
updates, including the current URL, path/query/hash and page title. Route events
are emitted regardless of consent; tag consent checks determine whether to track.

### Validation and release

Run `npm run check:consent-mode` for isolated runtime checks of GTM bootstrap,
failure handling, SSR script execution, saved choices, banner callbacks, installed
consent-library cookie writes and route payloads. Run `npm run build` afterwards.

Use the staging deployment and Fikrah's unpublished GTM workspace in Tag Assistant:

- Fresh visitor: all four Google values denied before GTM; no GA4 `collect`
  requests or new `_ga` cookies; Clarity blocked.
- Accept: no reload, consent granted, one `cookie_consent_granted` event and
  exactly one current-page `page_view`. Clarity starts only after acceptance.
- Internal navigation: one route event and one page view per page, with the
  correct location, path and title. Saved acceptance survives reload with one
  initial page view and no banner.
- Decline: `CookieConsent=false` survives reload and navigation; no analytics
  requests or new analytics cookies.
- Manage cookies: reopening does not itself change consent. Declining after
  acceptance denies consent immediately and stops subsequent analytics.
  Clarity must end its consented session and remove its cookies. Existing GA
  cookies may remain but must not be used for subsequent tracking.
- Accept again: tracking resumes with one current-page view, without duplicate
  tag installations.
- View page source: consent initialization precedes one GTM loader; the body
  starts with the direct `noscript` fallback before Gatsby markup.
- Check the policy link, keyboard access, mobile banner and floating controls.
  Verify GA4 Realtime/DebugView and Clarity consent state where applicable.

The automated checks do not prove live request blocking or page-view counts.
Publish the GTM workspace only after browser checks pass. Keep the prior deployment
and exported container version for a coordinated rollback; do not roll back only
one side of the website/container event contract.

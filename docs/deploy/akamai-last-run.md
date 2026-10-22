# Akamai deploy run — 2026-10-12T18:09:50.942Z

# Akamai Cloud deploy plan — WebXR/dist → Object Storage website → CDN

Mode: DRY RUN (nothing runs). By name: LINODE_TOKEN=absent, AK_S3_ACCESS_KEY_ID=absent, AK_S3_SECRET_ACCESS_KEY=absent, AK_BUCKET=absent, AK_REGION=absent, AK_S3_ENDPOINT=absent, AK_CDN_HOSTNAME=absent.

## 1. Build the flat folder (build)
python3 tools/bundle_webxr.py writes WebXR/dist and the generated _headers and _redirects

    $ python3 tools/bundle_webxr.py  — writes WebXR/dist, _headers and _redirects

  - check: WebXR/dist/index.html, smartcity-x.html, sitemap.xml, auth-config.json and _headers exist after the build

## 2. Gate on the checker suite (gate)
node tools/check_all.mjs must end in its 'All N checkers pass.' line

    $ node tools/check_all.mjs  — the whole suite

  - check: the last line is 'All N checkers pass.' — otherwise nothing is uploaded

## 3. Preflight (preflight)
the bucket named by AK_BUCKET is listed by the Linode API (read-only) and answers on its S3 endpoint; website hosting is set (index.html, 404.html)

    GET https://api.linode.com/v4/object-storage/buckets    # Authorization from $LINODE_TOKEN  — read-only; every page is read
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api head-bucket --bucket «AK_BUCKET»    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3 website s3://«AK_BUCKET» --index-document index.html --error-document 404.html    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — idempotent

  - check: a bucket labelled $AK_BUCKET is in the API's list
  - check: head-bucket succeeds with the access key
  - check: website hosting answers index.html and 404.html

## 4. Snapshot the live site (snapshot)
a server-side copy of the bucket's current objects under _rollback/ (private), for the rollback

    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3 sync s3://«AK_BUCKET»/ s3://«AK_BUCKET»/_rollback/ --delete --exclude _rollback/* --acl private    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — server-side copy; skipped on the first deploy (an empty bucket)

  - check: the _rollback/ copy holds as many objects as the live site had

## 5. Upload (upload)
WebXR/dist uploaded group by group with the Cache-Control _headers gives each path; the repo-layout redirects as redirect objects; objects no longer in the build removed

    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3 sync WebXR/dist s3://«AK_BUCKET»/ --exclude * --include … (137 more arguments) … --include treasures.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — 70 file(s) with Cache-Control "no-store"
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3 sync WebXR/dist s3://«AK_BUCKET»/ --exclude * --include … (337 more arguments) … --include underwater.html --cache-control public, max-age=0, must-revalidate --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — 170 file(s) with Cache-Control "public, max-age=0, must-revalidate"
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3 sync WebXR/dist s3://«AK_BUCKET»/ --exclude * --include … (655 more arguments) … --include vendor/icons/x.svg --cache-control public, max-age=31536000, immutable --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — 329 file(s) with Cache-Control "public, max-age=31536000, immutable"
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3 sync WebXR/dist s3://«AK_BUCKET»/ --exclude * --include … (1673 more arguments) … --include sims/youth-patrol-training.js --cache-control public, max-age=3600, must-revalidate --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — 838 file(s) with Cache-Control "public, max-age=3600, must-revalidate"
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key arcade/index.html --website-redirect-location /arcade.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /arcade/index.html → /arcade.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key arcade/dist/arcade.html --website-redirect-location /arcade.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /arcade/dist/arcade.html → /arcade.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key bayworld/index.html --website-redirect-location /bayworld.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /bayworld/index.html → /bayworld.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key bayworld/atlas.html --website-redirect-location /atlas.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /bayworld/atlas.html → /atlas.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key bayworld/dist/atlas.html --website-redirect-location /atlas.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /bayworld/dist/atlas.html → /atlas.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key bayworld/dist/bayworld.html --website-redirect-location /bayworld.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /bayworld/dist/bayworld.html → /bayworld.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key fairway/index.html --website-redirect-location /fairway.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /fairway/index.html → /fairway.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key fairway/dist/fairway.html --website-redirect-location /fairway.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /fairway/dist/fairway.html → /fairway.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key holodeck/index.html --website-redirect-location /holodeck.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /holodeck/index.html → /holodeck.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key holodeck/dist/holodeck.html --website-redirect-location /holodeck.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /holodeck/dist/holodeck.html → /holodeck.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key home --website-redirect-location /index.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /home → /index.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key home.html --website-redirect-location /index.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /home.html → /index.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key instructor/index.html --website-redirect-location /instructor-console.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /instructor/index.html → /instructor-console.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key instructor/dist/instructor-console.html --website-redirect-location /instructor-console.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /instructor/dist/instructor-console.html → /instructor-console.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key parishes/index.html --website-redirect-location /parishes.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /parishes/index.html → /parishes.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key parishes/dist/parishes.html --website-redirect-location /parishes.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /parishes/dist/parishes.html → /parishes.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key parishes/parishes.html --website-redirect-location /parishes.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /parishes/parishes.html → /parishes.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key race/index.html --website-redirect-location /race.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /race/index.html → /race.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key race/dist/race.html --website-redirect-location /race.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /race/dist/race.html → /race.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key redwood/index.html --website-redirect-location /redwood.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /redwood/index.html → /redwood.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key redwood/dist/redwood.html --website-redirect-location /redwood.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /redwood/dist/redwood.html → /redwood.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key redwood/redwood.html --website-redirect-location /redwood.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /redwood/redwood.html → /redwood.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key regatta/index.html --website-redirect-location /regatta.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /regatta/index.html → /regatta.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key regatta/dist/regatta.html --website-redirect-location /regatta.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /regatta/dist/regatta.html → /regatta.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key regatta/regatta.html --website-redirect-location /regatta.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /regatta/regatta.html → /regatta.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key smartcity/index.html --website-redirect-location /smartcity-x.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /smartcity/index.html → /smartcity-x.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key smartcity/dist/smartcity-x.html --website-redirect-location /smartcity-x.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /smartcity/dist/smartcity-x.html → /smartcity-x.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key summit/index.html --website-redirect-location /summit.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /summit/index.html → /summit.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key summit/dist/summit.html --website-redirect-location /summit.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /summit/dist/summit.html → /summit.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key trades/index.html --website-redirect-location /trade-skills-simulator.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /trades/index.html → /trade-skills-simulator.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key trades/dist/trade-skills-simulator.html --website-redirect-location /trade-skills-simulator.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /trades/dist/trade-skills-simulator.html → /trade-skills-simulator.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key underwater/dist/region.html --website-redirect-location /region.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /underwater/dist/region.html → /region.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key underwater/dist/underwater.html --website-redirect-location /underwater.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /underwater/dist/underwater.html → /underwater.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key underwater/region.html --website-redirect-location /region.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /underwater/region.html → /region.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api put-object --bucket «AK_BUCKET» --key underwater/underwater.html --website-redirect-location /underwater.html --cache-control no-store --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — redirect /underwater/underwater.html → /underwater.html
    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3api list-objects-v2 --bucket «AK_BUCKET» --query Contents[].Key --output json    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — then delete-objects for every key not in the build, not a redirect object and not under _rollback/

  - check: 1407 files in 4 Cache-Control group(s), as _headers gives them
  - check: 35 redirect objects; 2 wildcard redirect(s) belong on the CDN property (printed below)
  - check: no stale object remains outside the snapshot

## 6. Verify through the CDN (verify)
fetch the homepage, one bundle, auth-config.json, the security headers and the sitemap at https://$AK_CDN_HOSTNAME

    GET https://«AK_CDN_HOSTNAME»/
    GET https://«AK_CDN_HOSTNAME»/smartcity-x.html
    GET https://«AK_CDN_HOSTNAME»/auth-config.json
    GET https://«AK_CDN_HOSTNAME»/
    GET https://«AK_CDN_HOSTNAME»/sitemap.xml

  - check: GET / is 200, text/html and carries the site's <title>
  - check: GET /smartcity-x.html is 200 and larger than 1 MB
  - check: GET /auth-config.json is 200 and parses as JSON
  - check: the homepage answers with content-security-policy, x-content-type-options and referrer-policy (set on the CDN property)
  - check: GET /sitemap.xml lists exactly as many pages as the built WebXR/dist/sitemap.xml

## 7. Roll back on a failed verify (rollback)
the _rollback/ copy is synced back over the site; the run exits non-zero

    $ aws --endpoint-url https://«AK_S3_ENDPOINT» --region «AK_REGION» s3 sync s3://«AK_BUCKET»/_rollback/ s3://«AK_BUCKET»/ --delete --exclude _rollback/* --acl public-read    # needs $AK_S3_ACCESS_KEY_ID, $AK_S3_SECRET_ACCESS_KEY, $AK_S3_ENDPOINT, $AK_REGION  — only on a failed verify, and only when a snapshot was taken

  - check: only when a verify assertion failed; the run then exits 1 with the failed assertion named

## On the CDN property (set once by the owner, checked by step 6)

Response headers on every path, exactly as the Cloudflare deployment's _headers gives them:

    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: geolocation=(), payment=(), usb=()
    Cross-Origin-Opener-Policy: same-origin-allow-popups
    Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://accounts.google.com; style-src 'self' 'unsafe-inline' https://accounts.google.com; img-src 'self' data: blob: https://api.mapbox.com; font-src 'self' data:; media-src 'self' blob: data:; worker-src 'self' blob:; child-src 'self' blob:; connect-src 'self' https: https://api.mapbox.com https://events.mapbox.com https://login.microsoftonline.com https://accounts.google.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; frame-src 'self' https://accounts.google.com https://login.microsoftonline.com; object-src 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com https://login.microsoftonline.com

Wildcard redirects the bucket cannot express:

    /campus/* → /index.html (302)
    /portal/* → /index.html (302)

Cache: honour the origin's Cache-Control (each object carries the value above).

- 2026-10-12T18:09:50.945Z · all · not executed · dry run

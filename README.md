# Tierlistify

Tier lists built for phones. Tap to rank with one thumb, drag when you want precision, and publish lists for other people to rank themselves.

## Running it

```sh
npm install
npm run dev        # the app only, on http://localhost:5173
npm run dev:full   # the app plus the publish API. Still use port 5173.
npm test
```

To publish locally, put `TIERLISTIFY_PUBLISH_CODE=anything` in a `.env` file. `dev:full` needs the [Netlify CLI](https://docs.netlify.com/cli/get-started/). Use port 5173 rather than 8888: the SPA rewrite in `public/_redirects` also catches Vite's module requests when they go through Netlify's dev proxy, so the app won't load on 8888.

That proxy also replays any 403 or 404 against `/path.html`, `/path.htm`, and `/path/index.html`, so the response you get from `curl` on port 8888 isn't necessarily the one your function returned. `netlify/lib/handlers.test.ts` calls the handlers directly for that reason.

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_UNSPLASH_ACCESS_KEY` | Build | Enables the Photos search tab. Optional: it's hidden without a key. This key ends up in the client bundle. |
| `TIERLISTIFY_PUBLISH_CODE` | Functions | The invite code needed to publish. Publishing is off until this is set. Changing it retires the old code; lists already published stay up. |
| `TIERLISTIFY_ADMIN_TOKEN` | Functions | Lets you remove any published list. Optional. |

To take down a published list:

```sh
curl -X DELETE https://YOUR-SITE/api/lists/LIST_ID -H "x-list-token: $TIERLISTIFY_ADMIN_TOKEN"
```

## How it fits together

- **Lists live on the device**, in IndexedDB. There are no accounts. Uploaded images are cropped to 256px JPEGs and stored inline.
- **Publishing** is invite-only, through a Netlify Function backed by Netlify Blobs. Viewing, link sharing, and "Rank this yourself" need no code. Publishing returns a secret token, kept on the device, which is the only way to update or remove that list.
- **Forking** is what builds the catalog: "Rank this yourself" copies a published list's items into a new unranked list, so each published list acts as a template.
- **Image search** uses Wikipedia and AniList, which need no key and cover fictional subjects, plus Unsplash for photos.

The gesture rules that separate dragging from scrolling are documented at the top of `src/hooks/useDragEngine.ts`, and they have to stay in step with the `[data-scrolls]` CSS in `src/index.css`.

## Before launching this for real

- Opening publishing to everyone means adding moderation first. There's no review queue or report button, and accepting anonymous image uploads carries real liability.
- AniList's API is free for non-commercial use, so check its terms or swap it out before making money from this.
- Character art and posters belong to their rights holders. Wikipedia's images are served there under fair use, which doesn't automatically extend to this app.

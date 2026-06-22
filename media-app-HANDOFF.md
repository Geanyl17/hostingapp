# Architecture Handoff — Personal Image/Video Hosting App

Context for prompting Claude Code in the new repo. This app is for personal work use, deployed
on the same VPS as an existing production app (ani2nerdle), sharing nginx but otherwise fully
isolated (separate repo, separate containers, separate lifecycle).

## Deployment target

- Same VPS as the existing app, reachable via its own domain.
- nginx already owns ports 80/443 on this VPS for other apps. Don't run a second nginx bound to
  those ports — join the existing reverse-proxy pattern instead (see below).
- Docker Compose, not bare-metal — matches how everything else on this VPS runs.

## Reverse proxy / networking

- Use an **external Docker network** so this app's compose stack and the existing nginx (and any
  other app stacks) can all reach each other by container name without exposing host ports per app.
  ```
  docker network create shared-edge   # one-time, on the VPS
  ```
- This app's `docker-compose.yml` joins that network:
  ```yaml
  networks:
    default:
      external: true
      name: shared-edge
  ```
- No `ports:` mapping to the host is needed for the app container — nginx reaches it internally
  by service/container name on `shared-edge`. Only nginx itself binds 80/443.
- Add a new `server { listen 443 ssl; server_name yourdomain.com; }` block to the **existing**
  nginx.conf pointing `proxy_pass` at this app's container name — don't write a second nginx config
  for a second nginx instance.
- New SSL cert pair for the new domain (Let's Encrypt or Cloudflare origin cert depending on what's
  already in use for the other domains on this VPS — check `nginx/certs/` naming convention there).

## Critical nginx setting for media uploads

- The existing nginx config has a small global `client_max_body_size` (10M) tuned for a game, not
  media uploads. **Override it in this app's specific `server` block**, not globally — e.g. `500M`
  or whatever the largest expected upload is. Don't touch the global default other apps rely on.
- Consider also raising `proxy_read_timeout` / `client_body_timeout` in that block for large/slow
  uploads.

## Storage — the part that actually matters here

- This is the #1 difference from a typical stateless web app. Files must NOT live inside the
  container's writable layer — a rebuild or `docker compose up --build` wipes anything not in a
  volume.
- Use a **bind mount** to a host directory:
  ```yaml
  volumes:
    - /srv/media-app/uploads:/app/uploads
  ```
- Pick the host path deliberately and document it — this is the one thing that needs backing up.
  Everything else (containers, images) is disposable and rebuildable; this directory is not.
- Decide upload storage layout up front (e.g. `uploads/{userId}/{year}/{month}/{uuid}.ext`) before
  writing any code — retrofitting a storage layout after files exist is painful.
- If video transcoding/thumbnailing is needed, that's a separate concern from storage — don't
  conflate "where files live" with "how they get processed."

## Auth — this is personal-use, but don't skip it

- Since it's hosted on a public domain even if only you use it, put real auth in front of it
  (not just "obscure URL"). A simple single-user password gate or a proper auth provider (Supabase
  Auth, since it's already in use elsewhere) both work — just don't ship it open.
- Decide now whether uploaded media is meant to be link-shareable (public URLs, no auth needed to
  *view* a specific file once you have the link) vs. fully private (auth required to view anything).
  This decision shapes the whole API surface — don't leave it implicit.

## Isolation principles (carried over from the existing app's conventions)

- Separate repo, separate Dockerfile, separate compose file. Do not add this as a service inside
  the existing app's docker-compose.yml — that couples deploy/restart lifecycles unnecessarily.
- Don't share a database/Supabase project with the existing app unless there's a concrete reason
  to — keep blast radius contained to this app.
- Keep routes/API for this app self-contained; this mirrors how the existing app keeps each game
  mode's routes isolated rather than sharing/reusing across features.

## Suggested compose skeleton

```yaml
version: '3.8'
services:
  media-app:
    build: .
    container_name: media-app
    restart: always
    env_file: .env.production
    volumes:
      - /srv/media-app/uploads:/app/uploads
    networks:
      default:
        external: true
        name: shared-edge
```

## Open decisions to make before/while building

1. Tech stack for the backend (Node/Express matches the existing app's stack if consistency with
   tooling/familiarity matters; otherwise pick freely since there's no shared code).
2. Public link-sharing vs. fully private.
3. Whether old files ever get deleted/expired, or this is meant to grow unbounded — affects disk
   planning on the VPS.
4. Backup strategy for the bind-mounted uploads directory (this is the only stateful, irreplaceable
   data in the whole setup).

# Cloudflare Setup Notes

## Suggested Resources

- Pages project: `chongpang-toastmasters`
- Custom domain: `chongpangtmc.hellosg.org`
- R2 bucket: `chongpang-gallery`
- D1 database: `chongpang-site`

## Suggested D1 Tables

```sql
create table site_settings (
  key text primary key,
  value text not null,
  updated_at text not null
);

create table albums (
  id text primary key,
  title text not null,
  year text not null,
  category text not null,
  cover_url text,
  sort_order integer default 0,
  created_at text not null
);

create table photos (
  id text primary key,
  album_id text not null,
  url text not null,
  caption text,
  sort_order integer default 0,
  created_at text not null
);

create table posts (
  id text primary key,
  section text not null,
  title text not null,
  author text,
  content text,
  image_url text,
  sort_order integer default 0,
  published_at text,
  created_at text not null
);
```

## Build Settings

- Build command: `npm run build`
- Output directory: `dist`
- Node version: current Cloudflare Pages default is fine for this Vite app.

---
title: RSS CORS Proxy
emoji: 📡
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# RSS CORS Proxy

A simple CORS proxy for fetching RSS feeds from browsers.

## Usage

```
GET /proxy?url=<encoded-feed-url>
```

Example:
```
https://YOUR-SPACE.hf.space/proxy?url=https%3A%2F%2Fhnrss.org%2Ffrontpage
```

## Deploy to Hugging Face Spaces

1. Create a new Space at https://huggingface.co/new-space
2. Select "Docker" as the SDK
3. Upload these files: `Dockerfile`, `package.json`, `server.js`
4. Wait for it to build and deploy
5. Your proxy URL will be: `https://YOUR-USERNAME-YOUR-SPACE-NAME.hf.space`

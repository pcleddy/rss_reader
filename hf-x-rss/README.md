---
title: X RSS Feed
emoji: 🐦
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# X → RSS Feed Generator

Converts X/Twitter user timelines to RSS feeds.

## Usage

```
GET /feed/<username>
```

Example:
```
https://YOUR-SPACE.hf.space/feed/karpathy
```

## Setup

1. Create a new HF Space (Docker SDK)
2. Upload these files
3. Add secret: `X_BEARER_TOKEN` = your X API bearer token
4. Deploy!

## Add to RSS Reader

Once deployed, add feeds like:
```
https://masterp99-x-rss.hf.space/feed/karpathy
```

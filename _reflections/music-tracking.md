---
title: "Music Tracking (update!)"
date: 2020-03-04T08:47:29-07:00
tags: ["tech"]
---

**Note**: This post is a brief update to my [previous post](/reflections/media-tracking).

### Music Tracking

I wanted to write this post primarily to brag + advertise my recent improvements in music library management thanks to some fantastic software I recently discovered: [beets](http://beets.io/).

Beets is a lot of things, and if you sit on their current homepage long enough their taglines will boast their many, many features. At a high level though, beets is a tool to organize your music library. You feed it files and it can move them (or not), tag them (or not), and index them in your local beets' database. Once indexed, those files can be used in the huge [plugin ecosystem](https://beets.readthedocs.io/en/stable/plugins/index.html) to fill out other needs.

Also, the open source project is thriving. I'm proud [to have contributed](https://github.com/beetbox/beets/commit/d4d04c61aa577673c5c9cebb316490e80b6d7fa9) a small bug-fix for the Genius lyrics scraper, but the complexity of this project is well-managed.

### Current Workflow

Today, I keep a basic workflow with some manual steps to make sure I'm aware of what's going on. I don't like fully automated solutions for hobby projects like these because the point is to be in-tune with my collection and keep the quality in-tact.

So first step after I acquire any music files is to pass them through beets with `beets import -c`. `-c` is to copy files to leave the original intact, so I can move or dispose of them depending on where they came from. As I mentioned above, beets has a really good plugin ecosystem with things like lyrics and album art (and those are just the basics). When I run import, my config triggers album art and lyrics to be fetched automatically. For FLAC and other lossless formats, I also transcode a 320kbps version for portability and streaming.

`import` searches your folders/tracks against a set of sources that generally find what you have unless you live on the fringe of music. Every once in a while, it can be nice to add a release to [MusicBrainz](musicbrainz.org/) to fill your own need and provide back to the community. That being said, you will eventually come across some file you can't categorize. For this purpose I keep a separate music folder of 'Unsortables' outside of my primary beets library to not pollute the database. I'll check again every once in a while in case people add the previously-unsortable releases, but in general they're going to stay there.

Which brings us to actual listening. beets handily sorts and creates folders appropriately based on the track metadata, and I just point my music player to watch the parent folder. Every time I import some new tracks using beets, my music player ([MusicBee](https://getmusicbee.com/)) magically picks them up and they're ready to go! The music player also watches the unsortable folder separately so those tracks are also accessible. I have a couple of smart playlists in the player that can split up those tracks so I can navigate them individually.

Plex is also watching these folders and indexing the mp3s so it's accessible anywhere!

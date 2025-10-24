---
title: "Glue Prince: Wrap-up"
tags: ["games"]
date: 2025-10-23 21:55 -0400
---

This post is a write-up of a little project I just wrapped up and pushed to [GitHub](https://github.com/xhocquet/glue-prince).

Glue Prince came on the heels of me finishing an _actually_ fun game — [Blue Prince](https://www.blueprincegame.com/). The game is excellent, and as I type this, I’m considering writing a separate review of it. It might just be my top game of 2025!

Without getting too far off track, one of the standout mechanics in _Blue Prince_ is a hybrid hand-drawing and tile-placement system that lets you build your game board. Think [Betrayal at House on the Hill](https://boardgamegeek.com/boardgame/10547/betrayal-at-house-on-the-hill), but more interactive and strategic.

Around the same time, I started getting the itch for game dev, which I hadn't had in a long time, so I seized the opportunity to spin up this little demo. My main goal was to recreate a semblance of the tile-placement mechanic and see where it went.

Some highlights of the results:

- Programmatic UI: start menu, game UI, end screen
- Movement limited by tile placement, as in _Blue Prince_
- Hand tiles are randomly drawn from the deck
- Items replenish stamina, which is required to reach the chest
- Piggies will fight you — a dice roll determines whether you take damage
- Light animations using freely available assets

![screenshot 1](/reflections/glue-prince/main.jpg)
![screenshot 2](/reflections/glue-prince/main2.jpg)
![screenshot 3](/reflections/glue-prince/main3.jpg)
![screenshot 4](/reflections/glue-prince/main4.jpg)

A big part of this project was learning GameMaker (Studio 2 — they’ve had some versioning _stuff_). I chose it mainly because I wanted the quickest route to a prototype, and Unity felt a bit overkill for a simple 2D grid-based game. I stumbled upon GM while browsing online, and it hit the sweet spot: just enough abstraction, an interface for managing assets (with some half-decent editors), and a straightforward scripting framework.

It definitely has its quirks! The language, GML, looks vaguely like Java or C#. Writing in it feels fairly high-level, but you’re reliant on oddly specific methods and quirky documentation (a common software theme, I guess). Each object gets its own gigantor script file with a mix of inter-process calls and internal variables. There’s a lot of shared state, so you have to be careful with naming. Objects are structured around “steps,” which are sequential segments of their behavior centered around the update/draw loop.

As is tradition, you drop script objects into the game world to handle higher-level systems — levels, object management, asset loading, and so on. GameMaker provides helpers for asset management, but after a few dozen manual calls, you’ll want to write your own wrappers to keep things sane. Errors were generally well-handled and pointed to specific lines, which was nice.

As expected, a lot of cycles were “wasted” on assets — getting animations imported, timed, and playing nicely within the framework. I’ll continue to appreciate both the work of artists and the heavy lifting a good engine does to manage all that complexity!

This was a positive experience, and I think GameMaker is a solid choice for building quick prototypes of games (and even full-fledged ones!). I do think at scale the tools have limitations, which I was far from reaching. Glue Prince itself is a cute little demo, and I'm curious to see if it can run in a few years. Feel free to give it a spin!

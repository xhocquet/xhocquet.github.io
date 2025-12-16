---
title: Multiplayer game implementation with GD-Sync
date: 2025-12-15 20:00 -0500
tags: ['games', 'tech']
---

I recently completed a little side-quest to add multiplayer support to an existing game!

An acquaintance from a game development Discord server was looking for help adding multiplayer support to an existing hobby project. The game is a 'rocket jumper' game: think of the [Soldier from TF2](https://wiki.teamfortress.com/wiki/Soldier). Using this mechanic of launching yourself up with your own projectiles, you jump from platform to platform and attempt to reach the top (video below).

The game is intuitive and it works well in practice. Now imagine if you add in some friends and the fun of blasting them out of your way - way more fun.

I was interested in this project because:
 * Multiplayer for games is hard, so finding an entrypoint is valuable
 * Godot is a great entry point for nearly anything - the learning curve is smooth as butter
 * Personally, even having a game I _want_ to add multiplayer to is a challenge
 * Small + simple software makes great testbeds for learning and experimentation

So I offered my services and started getting to work. Thankfully the project was a modern Godot project, so I didn't have to worry about [Godot 3 support](https://docs.godotengine.org/en/stable/tutorials/migrating/upgrading_to_godot_4.html).


## Getting Started

My standard approach for solving new problems is to look at the landscape: in this case Godot multiplayer support. Good news: [it exists](https://docs.godotengine.org/en/stable/classes/class_multiplayersynchronizer.html). Unfortunately, like most game tooling you're given the components and ther is plenty of work left to put it together. Building a server with all of the syncing logic myself seemed like too much scope for a first project, so:

I went looking for plugins/libraries and landed on [GD-Sync](https://www.gd-sync.com/), which is what this post will be about. GD-Sync provides a Godot addon for abstracting the common use-cases of mutlipayer Godot games, providing their own servers as a service on top of that. For my purposes, I was particularly interested in their free tier of up to 4 players, perfect for testing with friends.

First things first, some setup. Using their site you generate an API key, download the plugin, and get that setup. There wasn't much to this step.

![GD-Sync setup](/reflections/gd-sync/gdsync-setup.png)

## Ownership & Authority

Once of the first important concepts I absorbed was object ownership and how it relates to server authority. I kept getting turned around within the multiple editor windows, but some key concepts kept me grounded:

**Objects have one and only one owner**

One of the first things that comes up is who owns what object. Ownership is important because you want to allow game clients to do processing for their player input so that you reduce latency and keep the game snappy. Ownership of things like players belong to the players, while a LOT of other thing should be left to the server authority.

In GD-Sync, setting ownership is done via:

```csharp
GDSync.set_gdsync_owner(game_object, player_id)
```

IDs are provided when connecting to GD-Sync servers, and are useful for managing the state of who is connected to a game server, for example. In my project, assigning ownership was done right after the player connected to the game server.

**Your game will have one and only one _authority server_**

An authority server is the primary instance of the game which gets the role of abitrating the game events and updating all the players on the results.

This is important because while players can report their own state without too much concern, we can't let them manage collisions, scoring, and other more sensitive operations. It's only a matter of time before a savvy technologist figures out a way to trick their local game into giving them an unfair advantage!

I'll talk about the solution to this later, but first the server setup.

GD-Sync abstracts a lot of this away which is lovely. Local multiplayer (where 2 players are connecting from the same machine) and full server-based multiplayer implemented in the game itself the same way, and they initialization of the library determines which mode you're in:

```csharp
GDSync.start_local_multiplayer()
// or
GDSync.start_multiplayer()
```

My implementation was limited to local multiplayer, meaning no external game instances existed besides the players themselves. This means the authority belongs to one of the connected players, typically the host of the lobby.

To start, I kept it simple and create a static lobby when the first player connects, and then had subsequent players connect to the same lobby. The first player is expected to be the authority and stick around for the duration of the game.

## Ownership for rockets, explosions, etc.

Earlier, I mentioned how users can't be allowed to tell the server whether they hit Player B or not. Any self-respecting hacker would immediately start spamming "HIT" commands to the server.

Instead, players are allowed to tell the server certain events like "Shoot bullet in direction Vector(x,y,z)". These instructions are optionally broadcast to all players in some engines (unsure about GD-Sync's implementation), allowing everyone to render at least the first few frames of a rocket shooting out of the player's RPG.

A sample command might look like:
```csharp
var missile := rocket_instantiator.instantiate_node()
```

The authority (host) is the only one truly processing the rocket's movement and physics in order to report that info back to the players. If the host detects a collision between a rocket and any of the players, it calculates the impact force and sends _that_ information to the affected player. The affected player processes that input and flies around, syncing their position to all players.

It truly is an amazing dance!

## Hooking into GD-Sync components

Once you lock in a mental model of object ownership and authorities, you move on the easy part! Hooking up your components and their attributes to various components and code needed by other players to sync data across the intertubes.

In my implementation, I used two core components:

**PropertySynchronizer**

[`PropertySynchronizer`](https://www.gd-sync.com/docs/custom-node-types#PropertySynchronizer) seems to be a wrapper around the aforementioned [`MultiplayerSynchronizer`](https://docs.godotengine.org/en/stable/classes/class_multiplayersynchronizer.html) that Godot provides.

Its purpose is to take one object (and optionally its sub-objects) and keep attributes in sync. These can be any type supported by Godot, as long as they're on your object.

In my solution, these were applied to each player instance as well as each _spawned_ rocket. Players that shoot the rockets were not responsible for creating these.

![PropertySynchronizer and NodeInstantiator](/reflections/gd-sync/gdsync-components.png)

**NodeInstantiator**

The other node you see in the screenshot above is the [`NodeInstantiator`](https://www.gd-sync.com/docs/custom-node-types#NodeInstantiator), which serves as a useful abstraction over game objects that spawn (many) other game objects, like a gun shooting bullets.

The specific challenge here is that if you shoot 60 bullets, you don't necessarily want to have to send 60 events, and there's a lot of optimizations available to interpolate that information and make it more efficient in a low-latency environment.

So this node handles that abstraction, and is configured with the object you want to spawn. GD-Sync's implementation spreads that information around, allowing other players to create the rocket and render it based on data from the player + authority.


## The big reveal

This was a great little learning experience, and the end result is exactly what we were going for!

<iframe width="100%" height=380px src="/reflections/gd-sync/demo.webm" frameborder="0" allowfullscreen></iframe>

---
layout: post
title: "Pathfinding: An Essential Tool"
date: 2026-02-01 18:37 -0500
tags: ["tech", "gamedev"]
---

## Finding a path

Game dev is a unique edge case of software development: the simplest games are made up of many interconnected systems of varying domains. Scratch the surface of any one and you'll find decades of published science, oftentimes having nothing to do with video games!

Recently, I witnessed a Discord argument about how to solve the following:

> Given a 2D platformer and a player that can walk and jump, how can I build an enemy AI that intuitively follows the player to any point on the map?

The OP was deep into their solution: tracing rays from the enemy to the player, calculating intersections, and deciding on movement based on the immediate surroundings.

My nose crinkled and I smelled something off! It was trivial to come up with an example where non-recursive, immediate neighbor-type pathing solutions would fail:

{:refdef: style="text-align: center;"}
![Naive pathing](/reflections/pathfinding/naive-pathing.png)
{: refdef}

I wanted to dig in and apply my knowledge of pathfinding to this problem.

## Pathfinding for Dummies

Pathfinding is finding the path between two nodes. While it may feel intuitive at smaller scales like in the diagram below, at scale you need to apply algorithms and data structures to help you out. Luckily, pathfinding is well-studied and has decades of prior art to absorb.

The important takeaway to remember is that pathfinding **is the same as boring old graph/tree search and traversal**. Dijkstra, A-star, and their cousins are all based on the mighty [BFS](https://en.wikipedia.org/wiki/Breadth-first_search).

Note: I will be using the terms 'graph' and 'directed tree' interchangeably here for brevity.

- **The graph/tree**: all the nodes and edges.
- **A node**: each circle above. A state, a position, a point in time, etc.
- **An edge**: a line between two nodes. It can have a direction, or not.

{:refdef: style="text-align: center;"}
![Animated BFS](/reflections/pathfinding/Animated_BFS.gif)
{: refdef}

Above, what you see is the algorithm iterating through the graph, one layer at a time. While simple, this is the foundation of all pathfinding algorithms (and many other types). Applied, this takes the shape of the aforementioned [A-star algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm):

{:refdef: style="text-align: center;"}
![A-star Pathing](/reflections/pathfinding/astar-pathing.png)
{: refdef}

Some traits that make A-star a good fit for pathfinding:

1. It's a greedy algorithm - it chooses the shortest path
2. It has a heuristic to speed up the search (distance to the goal)
3. Edges have weights, so you can prioritize paths (e.g. avoid the lava!)
4. Extensible. Much like all algorithms, you can add additional variables to the equation to tailor the algorithm to your needs.

## The Hypothesis

Given this understanding, my hypotheses are:

**1. A 2D platformer's map can be represented as a graph.**

Nodes would be 'zones' or 'waypoints'. Edges would contain information about travelling between points.

**2. An enemy AI can use a graph as a basis for effectively following a player.**

Once player positions are associated with a graph, finding paths between two points and applying them as movement should be manageable. Conveniently, deltas between nodes help inform AI decision-making for jumping vs. falling.

**3. There is no cost barrier to calculating paths at runtime.**

Based on intuition and prior experience, this is my belief given <100 platforms and 2 (possibly more) characters. I would like to revisit this question at scale at a later time.

## Applying Fundamentals

To prove this out, my first goal was setting up my proof of concept. I reached for my trusty [Godot](https://godotengine.org/) and scaffolded a project: some platforms, a player that can move and jump, and an enemy that wants to reach the player.

The first version had a simple left/right movement while I put the graph into place:

{:refdef: style="text-align: center;"}
![Enemy Chase](/reflections/pathfinding/enemychase.gif)
{: refdef}

**Graph Generation**

In my opinion, this was the most labor-intensive part of the project and an area that I'm sure you could dedicate _tons_ of time to. Thankfully my proof of concept was in 2D space and only had rectangular platforms, which made things much simpler to start out.

The pseudocode:

```python
platforms = gather_scene_data()
create_platform_left_right_nodes()
create_jump_nodes() # for L/R node, project downward to create jump nodes with offsets
sanitize_nodes() # de-dupe, merge nodes that overlap
create_edges() # a) build a set of edges for every platform's sections. b) build jump/fall edges
```

Soon, a semblance of a graph began to appear:

{:refdef: style="text-align: center;"}
![First Graph](/reflections/pathfinding/collapse-points.gif)
{: refdef}

There's an interesting balancing act at play where the graph generation is your chance to imbue your graph with information that will help your AI later. As I found myself writing overly complex logic in the AI controller, I would instead revisit my create/sanitize methods and make sure my graph was accurate and had the necessary information about the possibility of the jumps/falls.

I got mildly carried away with Godot debug tooling so that I could tune the behavior, but the results were worth it:

{:refdef: style="text-align: center;"}
![Final Editor](/reflections/pathfinding/final-editor.gif)
{: refdef}

**Pathfinding**

One of my joys in life is that when you're following fundamentals, things that should work _just work_. A\* is not an algorithm anyone needs to write from scratch anymore, so once I applied it to my graph and added some helpers for the enemy movement inputs, we had liftoff!

## Results

{:refdef: style="text-align: center;"}
![Follow 1](/reflections/pathfinding/follow1.gif)
{: refdef}

What we're looking at is A\* determining _where_ to go, and then about 250 lines (including line breaks and boilerplate) for enemy AI! You may notice some fancy lead-in jumps which account for 100 lines on their own. Not being able to cross the platforms from the bottom made me need to add a bit of fancy behavior to the jumping to accommodate.

In the below example you see the AI fail to jump to the top platform due to an edge case. Luckily, he finds his way!

{:refdef: style="text-align: center;"}
![Follow 2](/reflections/pathfinding/follow2.gif)
{: refdef}

I think this is a clear victory for our good friend the directed graph! 🎉

## Pathing beyond movement

When learning fundamentals, I think a flexible understanding helps apply theory to real life. I mentioned earlier on that pathfinding is graphs with a veneer of geometry and movement. Here are some other examples to flex the mind:

**Logic Puzzles**

Imagine building a Rubik's Cube solver. A naive approach would start inspecting a start state and building if statements. This is what the code ends up like:

```python
if (state == A):
  do_a()
if (state == B):
  do_b()
if (state == C):
  do_c()
```

Challenges:

- Adding a new state anywhere but the end of this becomes a mess. Before you know it you end up with states 4.0, 4.1, 4.2 (hey coworkers!).
- "Dropping in" to code like this is easier said than done. This code is not really reusable. In reality, `do_a()` modified data that you will not be able to reproduce perfectly from another source. If you do manage, auditing and logging starts to overlap and consume headspace that you don't have as you drown in 4 levels of conditionals!

Instead, we apply graphs and solve this the same way real Cubers (my term) do: finding the shortest path between the current state and the winning state.

**Dialogue Trees**

Another interesting application is dialogue trees in games. When moving away from linear stories, it can become complex to manage player state within a complex dialogue. By this I mean dialogue where:

- Certain choices send the player back to a menu
- Multiple sub-dialogues
- One or more start/end states

In these cases, the game isn't necessarily using pathing at runtime to determine much (although it can - the negative/positive sentiment of a choice could be a property of a graph edge). What it is useful for is figuring out if your dialogue tree is complete, and if your player can get stuck anywhere.

Some additional reading I found interesting here:

- [https://philipphagenlocher.de/post/video-game-dialogues-and-graph-theory/](https://philipphagenlocher.de/post/video-game-dialogues-and-graph-theory/)
- [https://medium.com/@danielpontillo/dialogue-systems-using-git-graphs-in-space-part-1-4d651bcfb52](https://medium.com/@danielpontillo/dialogue-systems-using-git-graphs-in-space-part-1-4d651bcfb52) [[archive](https://web.archive.org/web/20211006154446/https://medium.com/@danielpontillo/dialogue-systems-using-git-graphs-in-space-part-1-4d651bcfb52)]

## Thanks ✌️

I hope you found this topic as interesting as I do! Drop me a line if you want to chat more about it.

Project source: [https://github.com/xhocquet/2d-platformer-pathfinding-demo](https://github.com/xhocquet/2d-platformer-pathfinding-demo)

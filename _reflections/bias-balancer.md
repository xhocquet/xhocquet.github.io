---
title: "Bias Balancer"
date: 2020-11-30T20:05:06-06:00
tags: ["tech"]
---

The past few days I've been working on a tiny little project that's been on my mind.

So I want to introduce: [Bias Balancer](https://github.com/xhocquet/bias-balancer)!

We all know bias exists, but we tend to passively acknowledge it instead of actively fighting back. Like most problems, the first step is education and awareness. I wanted a way to measure bias in my browsing habits so that I could take steps to remedy it.

The idea for the tool is pretty simple: Install an extension on your browsers and it tracks the news sites you visit. Then, Bias Balancer gives you a 'Bias Score' on a +/- scale. If I notice myself constantly slipping in one direction, I will be more mindful to look for alternate points of view.

I generate this score very simply right now. In the [source code](https://github.com/xhocquet/bias-balancer), I indicate the data source that inspired this project. By using those numbers, I calculated a mean bias score for each news organization available. One every page load, if the host matches a URL in that list, the bias score is added to the user's current bias score.

What I have so far is a working prototype in Chrome/Firefox that will keep track of a score and update the extension's icon based on the score.

Possible enhancements:
 * Customizable bias lists
 * Better algorithm for the Bias Score.
    * Take into account volume
 * Filter index/root page views for more accurate tracking
 * Adjustable icon/level thresholds
 * Article topic grouping
 * Additional stats on bias by news organization, viewing habits, etc.

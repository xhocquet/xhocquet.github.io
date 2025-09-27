---
title: "Git and Uis"
date: 2021-02-28T12:15:58-06:00
tags: ["tech"]
---

Version control is one of the foundational tools of modern software development. Without it, we would still be manually uploading new files to servers every time a change was made. If you had enough forethought (or if you had been bit before), you might also backup the previous version of the files with `.bak` or in a folder *just in case*. Tools like Git and SVN implement the model of files changing over time and make it easy to move through time and inspect differences between different points in time.

My first experience with with version control was with video game mods. For some reason that I don't fully understand to this day, mods for Garry's Mod, Counter Strike, and others would be accessed with [TortoiseSVN](https://tortoisesvn.net/) on some server, downloaded locally, and moved to the appropriate folder. Later, in college, Git was introduced at a very high level both to collaborate with classmates and to give professors some basic auditing tools. While I'm thankful that version control was brought up at all, I think it should be a much larger focus given its ubiquity across software disciplines.

As you progress through a career in software, usage and expertise between people tends to diverge. Most people get by with their clones, pulls, branches, and pushes. Experts are seen as technicians to call over when something goes terribly wrong. While Git 'only' has a couple dozen commands, the flags and complexity available with each one can be overwhelming, especially when using one for the first time. Countless [Q&As](https://stackoverflow.com/questions/tagged/git), [guides](https://ohshitgit.com/), and [tools](https://desktop.github.com/) have been created to solve all kinds of holes that people get themselves into.

I consider myself pretty well-versed in Git, happy to handle a gnarly rebase, cherry-picking commits out of a messed up branch, or restoring accidentally deleted code and commits. And while Git is most definitely a 100% CLI tool, I don't think there's a need to restrict ourselves to only using the terminal to work with it. I like to use the best tool for the job, and part of that is graphical interfaces.

![Github Desktop](/reflections/git-and-uis/screenshot.png)

I'll frequently use a tool like [Github Desktop](https://desktop.github.com/) as a crucial step in my workflow to review my work before bugging a coworker for a code review. Don't be fooled by the name, the tool (and most Git tools like it) works with Git and does not need to involve any web service. Here are some of the ways I use graphical tools to check out my work:

- Reviewing the 'story' my commits tell and making sure it's easy to follow and review
- Reviewing the diffing of my code, and making sure that indentation or lint changes haven't blown up the PR into something horrible to review
- Clicking through files to quickly review my changes
- Comparing my code vs. test changes, and making sure there is (more or less) a 1:1 ratio

In other words, quick visual grokking of your work and the changes in your code is much more easily done in graphical tools that can give you color coding, code navigation, and other modern aids. This isn't to say that you can't colorize your Git diffs and do much of the same in the terminal, but web and modern UI tooling was built to handle the graphical piece of software, so use it!

---
title: "2018 Javascript Hack-o-thon Project 1"
date: 2018-11-20T21:20:41-07:00
tags: ["tech", "js"]
---

<div style="border: 5px solid black; margin: 24px auto 0; text-align: center; padding: 2px 24px;">
  Check out my code <a href="https://github.com/xhocquet/meteor-tasks">here</a>
</div>

## Meteor Exploration (and friend, Angular)

I decided to look into Meteor because of it's general popularity in enterprise. I was curious what made it attractive versus a typical app with Angular or React backed by some data store.

Meteor offers generous documentation and [tutorials](https://www.meteor.com/tutorials), one of which I decided to follow. I wasn't too interested in diving into mobile at this time, so I stuck with their simple to-do app. I promised myself I would add some kind of extra feature after the tutorial ended to prove I understood a basic amount of the framework

## Collections

Templates are pretty standard to any set of JS tools, but a Collection is my first encounter with a Meteor concept. To me, it seems like a database query is bound to the client via a socket or something. So that if that query returns different results, the view receives new data. From there, Angular takes over. It's worth mentioning this is only my second or third time using Angular, and it's still very new to me. Coming from a heavy Rails background, the concept of markup with template helpers is not entirely foreign.

I'm impressed with how quick I have a todo app where I can add things, in real-time without page reloads. I can't confidently say Rails would be quicker. I think Mongo deserves a fair share of the credit, though, since it removes quite a bit of complexity around models in relational DBs. Simply inserting an object looks like Rails, but I didn't have to declare a model. This is basically all you need, and you aren't yet defining typed fields of any sort:

{{< highlight js >}}
export const Tasks = new Mongo.Collection('tasks');
{{< / highlight >}}

## Code Separation

One of the things I'm starting to dislike is the at times complex Javascript you end up writing in the angular tags.

React solves this by redefining HTML tags in Javascript. The React component files you end up with are all Javascript, including the classes you toggle in the same way you do in Angular. The difference is pretty large:

{{< highlight js >}}
# Angular
<span ng-class="{'active': item.isActive}"
{{< / highlight >}}

vs.

{{< highlight js >}}
# React
const classes = classnames('generic-class', {'active': item.isActive})
return(
  <span classNames={classes} />
)
{{< / highlight >}}

There's definitely a bunch more code behind both of these examples, but I think I would objectively say the React code takes up more room. But, I still think it's better because of the consistency of the language. The big advantage is you can focus on a single type of developer for more of your coding, and as a developer you can stay in Javascript in your mind without switching back and forth. In fact, that's one of the huge selling points of all these new JS servers.

Second, imagine scaling this. There's probably a solution to this I don't know yet, because I can't imagine big corporations running Angular apps with a half-dozen conditional classes on a piece of text or an input. It basically looks like in-line CSS, which we've long since abandoned for better tools.

## Data Binding

I just reached my first usage of `getReactively()`, a major data-binding component of Angular/Meteor.

> To make Meteor understand Angular bindings and the other way around, we use [$scope.getReactively](https://angular-meteor.com/api/angular-meteor/1.3.11/get-reactively) function that turns Angular scope variables into [Meteor reactive variables](http://docs.meteor.com/#/full/reactivevar_pkg).

It lives in the controller, more specifically in the `tasks()` action where it makes the DB call. My closest approximation would be a Redux selector ([brand spankin' new!](https://github.com/reduxjs/reselect)), filtering data in the connection to the store.

There's a lot of 'magic' going on for data-binding to work without a lot of extra boiler-plate:
- Putting controller methods in your view creates a data-bind for that method. What triggers it?
- Selector-like methods in the actions create data-bindings for the property you hook into.
- Just updating the DB triggers a re-render (for example, checking an item). Thanks to the collection (`Mongo.Collection('tasks')`)

My general experience thus far is definitely one I shared with Rails when I started. Lots of things I don't yet understand are helping me, and it feels good! I've written very little code overall to create a functional CRUD app with a user-auth library and scoped records.

## More Separation and Optimistic UI

As we start to peel away the incorrect basic setup and put in place more traditional patterns, I start to notice some more recognizable features of Meteor. Methods are Meteor's [IPC](https://en.wikipedia.org/wiki/Inter-process_communication), it allows the client to speak to the server. In React or Vanilla JS, that means writing a web request and handling the response. Meteor wraps that up with the Method functionality so that you just call the method from the frontend and the request is handled for you.

Optimistic UI, however, is completely new to me. According to them:

> A simulation of the method runs directly on the client to attempt to predict the outcome of the server call using the available information

If I try to parse that a little further, it seems like if you're acting on data the client already has, there's a good chance you get client-side speed in terms of interactions. Deleting a task, for example, should be straightforward and the client will hide the task before the request even completes. This kind of hybrid solution is a good sign of creativity and something Rails does a bunch (`.includes`, `size`, etc.). With a good framework, if you can leave some of these details up to it completely your efficiency will sharply increase.

The downside, of course, is if there's an error, something has to revert on the screen which can seem a bit buggy. I think this is an OK compromise to make since you should expect 99.9% of your apps actions to succeed. If there's an error message in addition to the flashy UI, it should be clear what happened. I could even argue that the flickering UI is the least surprising behavior for an action that doesn't work. Very cool functionality built-in!

## Finishing Touches

The more I add to the app, the more I feel the speed resembling any hot-loading environment. The same issues I face when saving a file multiple times in a row happen in Meteor, so it isn't a silver bullet.

I ended up just adding the ability to sort the tasks by content as a toggle for my personal task. It was really easy, and I see tons of opportunities for libraries and more tools to help devs here (if they don't already exist). Building a query conditionally in the same way you build classes. Modifying an object by hand gets messy. Entire modules for collection displays where you just pass in the model and config, and it does the rest. And better shorthand for the IPC piece. Writing the connection of methods between the client and server is a notorious hot-spot for failure, and I'm surprised Meteor's implementation is so brittle. By using strings, typos are bound to happen. It's a similar issue to Redux's action types. You end up maintaining a huge list of constants, because if you don't you have to be perfect at writing strings 100% of the time. You can't do that, so we end up with constants!

I'm really liking Meteor so far. It feels a lot like when I first used Rails, and I could see myself using it for quick, beautiful prototypes where I know I won't be maintaining code. A lot of magic is involved, which really is clever code that has yet to be understood. As I now start to understand Rails magic pretty well, learning Meteor magic seems less daunting if that's what I want to do.

My worries start to pile up with large projects. I can't yet see patterns emerging on how to structure large code-bases, which is what I would hope frameworks geared for enterprise would offer. I can't say that I'm even positive that's one of the selling points here, it seems like a modern, hip JS project. Maybe the Angular piece strikes me as enterprise. Between maintaining complex UI with strings and methods in HTML, mixing languages indiscriminately, and an unresolved weakness between the server and client, there's enough to worry me before going with it long-term.

Enjoyable nonetheless!

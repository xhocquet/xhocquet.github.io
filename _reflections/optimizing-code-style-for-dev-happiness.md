---
title: "Optimizing Code Style for Developer Happiness"
date: 2018-11-17T11:52:06-07:00
tags: ["tech"]
---

While I started my programming career closer to the hardware with C, I've come to be comfortable as web dev using Ruby and Javascript as my main languages. Ruby will be my focus in this post, but believe the two languages share more similarities than most realize.

These days, it feels like more and more time passes between each time I write code. Everyone on my career path goes through it, but as you graduate past a junior role you start to offer more and more of your time to others instead of strictly writing code. This has its own perks: I get to look at a lot more code since I review more, and I get to learn through others as I spend more time pair-programming and discussing problems. The reason I started this job though was to write code. So as the times get fewer and farther in between, I make sure to take advantage of all my opportunities to train my muscles.

One of my favorite things to do is write code I think others would enjoy to read and use. I've used enough good (and bad) libraries to know a few things developers like and dislike, and inherited enough legacy code to know what matters to me when I dig into a new codebase.

An important caveat is that I usually don't prioritize performance. Writing code under more difficult constraints may end up looking a lot different, and some of my code can arguably be inefficient. Coming from a game development background, I'm relatively aware of the costs involved and tend to deal with them as they come up. Considering the many other bottlenecks in software development, how I loop through a model data is usually not my primary focus. When I write code in a team, I prioritize readability and maintainability first.

## Over-zealous Meta-programming

I think many people will immediately know what I'm talking about. If not, allow me to lead with an example similar to real code I've worked with. In my case, there were a good two-dozen methods in the array.

```
class AdvancedProgrammingTechniquesConcern
  included do
    ['average', 'sum', 'max', 'min'].each do |method|
        method_name = "calculate_#{method}"
        define_method(method_name) do
            klass = "#{method.titleize}CalcuationService".classify
            klass.calculate(self)
        end
    end
  end
end
```

My first argument against a lot of these is that there's just not much reason to do it. In this case, writing each method out would be roughly the same amount of lines of code. In my real-life instance it may have been a bit more, but who cares? You aren't paid by the line. There are many more people creating software limited by time rather than resources.

My second argument is just plain practical. Tomorrow, I'm going to have to debug the following code:

```
  # average_calculation_controller.rb
  def create
    Calcuation.new(params).calculate_average
  end
```

Something is wrong with the calculations coming from this API endpoint. My first move may be to look at the calculation method to see if anything seems wrong there. I would probably search for `calculate_average`. Guess what? Nothing! Because of the string interpolation, searching the method name doesn't give you the method definition. Kind of odd, right?

Knowing that I would see that as needless confusion, I skip the opportunity to show off my meta-programming skills (time and place!) and write something a bit more 'basic':

```
class AdvancedProgrammingTechniquesConcern
  included do
    def average
      AverageCalculationService.calculate(self)
    end

    def sum
      SumCalculationService.calculate(self)
    end

    # ...
  end
end
```

DRY evangelists will cry out: "But why would you write something so similar out so many times?". My response is simple and two-part: Because copy-pasting a few lines doesn't cost you so much time, and people down the line will have an easier time understanding your code. In most real-world environments, software engineering is driven by how well developers and the rest of the company communicate with each other. Code readability is a significant part of a developer's ability to communicate with other developers.

## Inheritance to Death

[OOP](https://en.wikipedia.org/wiki/Object-oriented_programming), like any design system is opinionated and double-sided. And, like any system in my opinion, there are parts to use and parts to choose when to use. Ruby and Javascript are both object-oriented. They literally inherit everything from a base Object. But when OOP talks about objects, It essentially means your data model and the structure of your code. In Rails, your class structure also tends to drive your folder structure, so it's important to keep it sane.

Again, let me defer to a real-life-inspired example:

```
# Home sweet home
class ApplicationController < ActiveController::Base
end

# We upgraded our app once upon a time
module V2
  class ApplicationController < ::ApplicationController
  end
end

# You should always keep your API controllers separate!
module Api
  class BaseController < V2::ApplicationController
  end
end

module V2; class AdminController; end; end
module V2; class UserController; end; end
# Etc.
```


You get the idea. What you'll also get is a scattered collection of business rules crucial to your application's functioning that will be hard to find, read, and reason about. Certain behaviors will be inherited in your API controller all the way from the original base controller. Arguably there shouldn't be an original anymore, but it's often the case to leave behind some legacy code to maintain the status quo and not have to migrate core functionality.

Another way to think about this problem is to consider some authentication rules that may live in here. As a codebase grows organically, it's likely that each of these controllers have their own authentication mechanism: the user controller uses Devise, the API controller uses JWT, admin has an additional layer, etc. At first glance it seems to make sense to keep these rules in their base controllers, but it starts to fall apart once a new dev comes in looking for answers.

In my opinion, you're better off with an `AuthService` that is used in all controllers and contains all business/application logic around this function. You can definitely break the service down into smaller chunks, but the point is that as a dev, I shouldn't have to go dig through a hodge-podge of files to get a holistic picture of authentication for a system. If I have one `services/authentication/` folder to look at, the task seems less daunting.

## Pseudo-refactoring Using Concerns and Imports

As a life-long learner, being wrong can be a great thing. More importantly, finding out you were wrong and improving is what learning is all about. I'll admit I abused concerns to hide the truth of my early applications: I didn't know where to put things.

A closet is a perfect analogy. When you tell someone to clean up their space, the lazy (or efficient) may just shove things in the closet. Putting code into a concern regularly falls square into the category of putting your mess in the closet. If you are willing and able to spend the extra effort to think through the issue, there is usually a better solution.

There's a bunch of alternatives and it comes down to your application structure. My preference tends towards using well-named services called as class methods. Rather than re-write it all though, I'll refer to a great blog post over at Codeship on this very topic: [When To Be Concerned About Concerns](https://blog.codeship.com/when-to-be-concerned-about-concerns/)

The article mentions this, but from a developer standpoint it usually comes back to the discoverability of your code. When you have tons of crossing streams between multiple concerns and even more naming abstractions added to handle the extra files/classes, it can get annoying to search for functionality like in a simpler application. A simple separation of model functionality and the functionality of the extracted code allows a developer to focus on one file at a time.

## Make Subjective Decisions Once, Then Automate Them

This one really bothers me since it can be a real time sink.

I consider all things code-styling, formatting, and general conventions to be purely subjective decisions. How to format your conditionals, conventions with folder structure, and how you standardize similar items (services, classes, mailers) does not have any basis in fact nor does it drive noticeable efficiency gains. These are all things any developer should be able to adapt to and shouldn't consume significant amounts of developer time discussing.

```
if (true)
{
  // I will never understand people who write if-statements like this
}
```

Enter: Linters! Linters are fantastic, and in our modern day-and-age, super customizable. The beauty is in the fact that you don't need to write complex regex to write a linter. Linters parse code into what basically ends up being an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree). This gives you the ability to walk up and down the code in an intuitive tree-structure format. The contents of an if-conditional are the children of the if-conditional node. All code has a parent all the way up to the original Ruby call. After building familiarity with the methods available, you can write some [very complex linting rules](https://gist.github.com/xhocquet/719a8bdeb336b5c463c8fef9e2deed5a) based off of whether a piece of code is a class or module, or if there's a private method call.

From there, the possibilities are pretty much endless:

- Ensure all new services implement the base service interface
- Deprecate code-styles by marking them with a linter warning
- Bake in common readability preferences (e.g. preventing complex conditionals in views)

The final piece of the scrumptious linting cake is that it ties into your build process. Wherever you build runs, you can wrap your linters all up in a script and handle it your way or format the output directly into your build tools. Either way, all it takes is a bad response to let your build tool know that a lint error occurred, which the dev can then go fix before requesting a code review.

The end-goal is really to remove menial things like spacing and conditional formatting from a developer's mind, and let them put that energy towards creative, intuitive solutions for the real problems we want to solve as a business. In my mind, having to ask for a syntax or style fix is a wasted cycle.

## Closing Notes

As you can tell, all of these points are completely subjective in of themselves and there's plenty of other ways of trying to deal with this. I'm a firm believer in dumbing things down so people can focus on harder problems. Just like how I use a package to avoid having to deal with all the intricacies of authentication for every new project, I use conventions and code simplification to streamline my development process and help my peers.

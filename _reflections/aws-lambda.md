---
title: "AWS Lambda"
date: 2018-08-26T14:06:44-06:00
tags: ["tech"]
---

It feels like every day, it gets harder to put a simple website online. Between defending against spam, vulnerabilities in your dependencies, system maintenance, scaling, and a million others, the sheer amount of knowledge needed can be overwhelming. Even though most sites share the same base, you can be sure you'll spend a significant amount of time patching it together again from past experiences and scattered blog posts.

Services like [Heroku](https://www.heroku.com/), [Digital Ocean](https://www.digitalocean.com/), and [AWS](https://aws.amazon.com/) attempt to make all of this more accessible by abstracting it all away in a variety of tools. S3 for storage, EC2 for servers, Elastic IP for networking are some of the examples of what AWS offers to create and manage your infrastructure.

Today, I want to focus on a specific piece of AWS, and how Lambdas can be an ideal solution to your sporadic processing problems!

# Lambdas?
In programming, a [lambda](https://en.wikipedia.org/wiki/Anonymous_function) (or anonymous function or closure) is a function that isn't tied to a source. A good lambda can be called from anywhere, and give you the same output for the same input.

AWS takes idea, and puts it on the cloud:

![](/reflections/lambda/1.png)

Above, you'll see some of the possible connections it has to other services.

Common uses of Lambdas range from:

- When a request comes through an API, process the payload and respond to the request.
- When an object is uploaded to S3, do something with that object and log the results.
- Process the background job queue with my Lambda and send results to my application.

******

# Why should I use one?

## Price
First of all, it's free up to a limit. Their [pricing page](https://aws.amazon.com/lambda/pricing/) says you get 400,000 GB-seconds free per month, with a max of 1 million requests. With some creativity, that can serve a small startup extremely well.

After that, the prices are competitive and tiny per operation. The cost benefit tails off for the largest scale, but for a majority of cases it's cheaper than running your own solution.

## Scaling help

Second, you get to leverage AWS' massive infrastructure and near-endless resources. If you're reading this, you're probably their target customer. Not only is the compute power cheap, but with it you get a managed scalable system that you don't need to worry about.

If tomorrow you suddenly see a hundred-fold increase in traffic, your Lambdas will run as they always have, spread as wide as needed (and/or configured).

## Familiar tools

Third, you can leverage a language and package system you already know. Lambdas are written in a set of allowed languages allowing you to use most of your favorite technologies and their ecosystems.

![](/reflections/lambda/2.png)

For Javascript, you can bundle node modules into your Lambda. For Go, you can include its packages. A Lambda is just a function, but your function can include a plethora of modules (up to a size limit for the Lambda), leaving your options quite open.

******

# Why shouldn't I use Lambdas?
## AWS remains complex

![](/reflections/lambda/3.png)

At the end of the day, using even one piece of AWS can be an undertaking. If you or your developers don't use AWS yet, opening it for the first time can be intimidating. There's a minimum of security and access configurations you'll need to run a Lambda, but thankfully there's plenty of guides online to help you out.

## Asynchronous is key
Since your function will be running over and over on this Lambda, charged by GB of memory per second, you'll want to aggressively scope what you want it to do before you start development. Lambdas excel at small operations, though you won't save money with operations below 100ms. You are also constrained by AWS with how much code you can upload.

If your Lambda is interacting with outside services like a document store, API, or another server, you'll also want to tightly control the asynchronous flow of those calls. Worst-case scenario, a web request gets stuck and your Lambda times out. Not only did you pay for the most amount of waste allowed under your usage limits, but there wasn't even a result!

## Ease-of-development
While using your favorite language and its modules is awesome, actually putting code on the Lambda is not so glorious.

Your options are either to use the editor provided in the dashboard:

![](/reflections/lambda/4.png)

This editor is honestly not that bad and has a respectable amount of features. Anyone who has used a web-based code editor knows its challenges, and Amazon hasn't solved them here.

Your other options are to upload the code package either via a manual zip file upload or S3. This will be your preferred method if you plan on including packages. As Lambda uses a special event set-up, you'll find yourself needing to build a testing environment in your local system as well if you're writing anything somewhat complicated. What should have been just writing some code and throwing it on AWS becomes a somewhat involved develop and build process.

******

# My use cases
I've so far implemented two of these for different cases.

## Document processing
At Maxwell, we're processing PDFs that can get quite large into images for another system. We ran into challenges isolating this sporadic processing within our infrastructure, resulting in ripple-effects when many large documents came in simultaneously.

Lambdas came to mind as a great solution to isolate the processing from our systems, while also allowing us to tailor memory consumption based on the trends we were seeing. It took about a day for us to build a simple Lambda to hook into our document store, and start processing documents in a variety of ways using popular packages.

As we put it into effect, we expect to be able to reduce some of our larger servers we had boosted because of large document processing. In addition, we didn't spend that much time to get a working proof of concept online. The other great benefit was that we were able to use a language we already know, so the spin-up time was exclusively AWS-related, not code-related.

## Web scraping
For a [personal project](http://diyrss.info), I ping websites regularly to check for new content. The issue is the same: for a flaky operation like scraping a web page, residual effects from poorly managed background queues can leak into your application and cause other issues. This is doubly the case when building a system like this alone, and allows me to off-shore some of the complexities of the task so I can focus on delivery.

# Conclusions
All-in-all, Lambdas are a great solution for a variety of problems. More importantly, it's a way of solving a problem that you anticipate will need scaling you aren't yet ready to tackle head-on. While it isn't a replacement for a properly architected system, in today's fast-paced landscape it's one of your best options for putting a scalable function on the web.

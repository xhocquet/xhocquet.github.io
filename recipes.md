---
title: recipes
---

> Recipes I've tried and enjoyed. I like old, classic recipes with few ingredients that allow techniques to show through the final dish.

{% for recipe in site.recipes %}
  [{{ recipe.title }}]({{ recipe.url | relative_url }})
{% endfor %}

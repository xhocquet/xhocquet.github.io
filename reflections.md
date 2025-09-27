---
title: reflections
---

{% for reflection in site.reflections reversed %}
### [{{ reflection.title }}]({{ reflection.url | remove: '.html' | remove: '.md' }})
{% endfor %}

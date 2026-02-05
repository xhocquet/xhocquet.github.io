---
title: reflections
---

<div class="reflections-ideas toc-style">
  <p class="toc-title">Percolating Ideas:</p>
  <ul>
    <li>Tiers of LLM usage</li>
    <li>Game dev, all of it</li>
  </ul>
</div>

{% assign pinned = site.reflections | where_exp: "item", "item.tags contains 'pinned'" | reverse %}
{% assign rest = site.reflections | reverse %}

**Pinned**

{% for reflection in pinned %}

### [{{ reflection.title }}]({{ reflection.url | remove: '.html' | remove: '.md' }})

{% endfor %}

---

**Recent**

{% for reflection in rest %}
{% unless reflection.tags contains 'pinned' %}

### [{{ reflection.title }}]({{ reflection.url | remove: '.html' | remove: '.md' }})

{% endunless %}
{% endfor %}

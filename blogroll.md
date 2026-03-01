---
title: blogroll
---

{% for item in site.blogroll %}

### <a href="{{ item.link }}" target="_blank" rel="noopener noreferrer">{{ item.title }}</a>

{% if item.excerpt %}
{{ item.excerpt | markdownify }}
{% endif %}

{% endfor %}

source 'https://rubygems.org'

gem 'jekyll'

group :jekyll_plugins do
  gem 'jekyll-compose'
  gem 'jekyll-feed'
  gem 'jekyll-paginate'
  gem 'minima', github: 'jekyll/minima', ref: 'b3385fe'
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :windows do
  gem 'tzinfo'
  gem 'tzinfo-data'
end

# Performance-booster for watching directories on Windows
gem 'http_parser.rb'
gem 'wdm', platforms: [:windows]

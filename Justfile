serve:
  bundle exec jekyll serve

deploy:
  bundle exec jekyll build
  git checkout public
  rm -rf *
  cp -r _site/* .
  rm -rf _site
  git add .
  git commit -m "Deploy site"
  git push origin public
  git checkout main

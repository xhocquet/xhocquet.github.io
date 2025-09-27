serve:
  bundle exec jekyll serve

deploy:
  bundle exec jekyll build
  git checkout public
  find -type d ! -name "_site" -delete
  mv _site/* ./
  rm -rf _site
  git add .
  git commit -m "Deploy site"
  git push origin public
  git checkout main

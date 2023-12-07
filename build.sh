set -e

DEST="../../Python/central-heating-api/application/front-end/"

# We first grep 'const AUTH_URL' then invert grep for lines starting with '//'
AUTH_URL=$(grep "const AUTH_URL" ./src/context/AuthContext.tsx | grep -v '^//')

# Cut the string to only get the URL
AUTH_URL=$(echo $AUTH_URL | awk -F'"' '{print $2}')


if [[ "$AUTH_URL" == "http://localhost:8080" ]]; then
  echo "AUTH_URL is set to localhost."
  exit 1
fi

npm run build
mv "$DEST/manifest.webmanifest" ./
rm -rf "$DEST"
cp -r dist/ "$DEST"
mv ./manifest.webmanifest "$DEST"
python replace_uri.py
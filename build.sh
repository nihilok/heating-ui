set -e

DEST="../../Python/central-heating-api/application/front-end/"

AUTH_URL=$(grep "const AUTH_URL" "$(pwd)/src/context/AuthContext.tsx"  | grep -v '^//' | awk -F'"' '{print $2}')

if [[ "$AUTH_URL" == "http://localhost:8080" ]]; then
  echo "AUTH_URL is set to localhost."
  exit 1
else
  echo "AUTH_URL is not set to localhost."
  exit 0
fi

npm run build
mv "$DEST/manifest.webmanifest" ./
rm -rf "$DEST"
cp -r dist/ "$DEST"
mv ./manifest.webmanifest "$DEST"
python replace_uri.py
DEST="../../Python/central-heating-api/application/front-end/"

npm run build
mv "$DEST/manifest.webmanifest" ./
rm -rf "$DEST"
cp -r dist/ "$DEST"
mv ./manifest.webmanifest "$DEST"
python replace_uri.py
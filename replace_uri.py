from pathlib import Path

from bs4 import BeautifulSoup

root = Path("/Users/michael/Personal/Python/central-heating-api/application/front-end")

# Open the HTML file and read its content
with open(root / "index.html", "r") as html_file:
    html_content = html_file.read()

# Create a BeautifulSoup object and specify the parser
soup = BeautifulSoup(html_content, "html.parser")

# Find all tags that have an src attribute and add /static prefix
for tag in soup.find_all(src=True):
    tag["src"] = "/static" + tag["src"]

# Find all tags that have an href attribute and add /static prefix
for tag in soup.find_all(href=True):
    tag["href"] = "/static" + tag["href"]

# Write the modified HTML back to the file
with open(root / "index.html", "w") as html_file:
    html_file.write(str(soup))

# google-site-search
## Search your site with Google Custom Search Engine v1

Use and instance of the GoogleCSE function to search your site. This is using vanilla javascript but is still a work in progress. If using this in a production environment make sure you're running everything through Babel.

#### HOW TO USE:

1. Add this project to the approprate place within your projects. This is most likely where you put all your other libraries. If you don't have anywhere just create a /libs directory and throw it in there.

2. Add GoogleCSE into your bundled Javascript. So if you're using a task runner like gulp bundle this with your Footer.js or the likes.

3. Check if GoogleCSE is defined `typeof GoogleCSE !== "undefined"`

4. Create Search Engine ID: https://cse.google.com/cse/

5. Create Google Custom Search v1 api key `https://code.google.com/apis/console/`

6. Initialize Your Search:

```
const apiKey = "API_KEY_HERE";
const cx = "SEARCH_ENGINE_ID_HERE";

// GoogleSearch variable is now an instance of GoogleCSE

const GoogleSearch = new GoogleCSE({ apiKey, cx });

// Possible search query

var searchQuery = "Dank Memes";

// Pass our query

GoogleSearch._searchSite(searchQuery);

// Rendered Results will look for the following markup

<div class="google-wrapper">
  <div id="google-controls">
    <p id="google-total-results"></p>
    <input id="google-search-input" type="text" placeholder="Search..." />
  </div>
  <div id="google-results"></div>
  <div id="google-pagination"></div>
</div>
```

/**
 *   1. Application State
 *   2. Initial State
 *   3. Set State Method
 *   4. Response Filter Method
 *   5. Search Website Method
 *   6. Pagination Method
 *   7. Render Search Results Method
 *
 *   Usage:
 *
 *   const apiKey = "API_KEY_HERE";
 *   const cx = "CUSTOM_SEARCH_ENGINE_ID_HERE";
 *   const GoogleSearch = new GooogleCSE({apiKey, cx});
 *
 *   GoogleSearch._searchSite("YOUR_QUERY");
 */

function GoogleCSE({ apiKey, cx }) {
  // Check to see if props were supplied.
  // If not trigger warning
  if (typeof apiKey === "undefined" || typeof cx === "undefined") {
    return { invalid: true };
  }

  /**
   *   -----------------------------------------------------------------------------
   *   1: Application State.
   *   Description: Current search results and api credentials from initializing.
   *   @private
   *   -----------------------------------------------------------------------------
   */

  let state = {
    apiKey: apiKey,
    cx: cx,
    baseUrl: "https://www.googleapis.com/customsearch/v1",
    nextPage: null,
    prevPage: null,
    query: null,
    totalResults: 0,
    pages: 0,
    currentResults: [],
    searchTime: 0,
    currentPage: 1,
  };

  // On the search results page console enter: GoogleSearch.viewState
  // This is a read only property for debugging
  Object.defineProperty(this, "viewState", {
    value: state,
  });

  /**
   *   -----------------------------------------------------------------------------
   *   2: Initial State.
   *   Description: Frozen copy of state object for app reset.
   *   @private
   *   -----------------------------------------------------------------------------
   */

  const initialState = Object.freeze(state);

  /**
   *   -----------------------------------------------------------------------------
   *   3: Set State Method.
   *   Description: Pass an object to merge with state.
   *   @private
   *   @param {Object} newState
   *   -----------------------------------------------------------------------------
   */

  const _setState = (newState) => {
    // If it's not a object exit out with a warning
    if (typeof newState !== "object") {
      console.warn("Set state called on non-object");
      return;
    }

    // Merging State using Object Spread
    state = Object.assign({}, state, newState);

    // Set State runs our render method each time its called
    this._render();
    return;
  };

  /**
   *   -----------------------------------------------------------------------------
   *   4: Response Filter Method.
   *   Description: Series of tests before setting state and rendering.
   *   @private
   *   @param {Object} res
   *   -----------------------------------------------------------------------------
   */

  const _purifyResponse = (res) => {
    if (res.error) {
      console.warn(res.error.message);
      return;
    }

    let currentResults = [],
      nextPage = null,
      prevPage = null,
      searchTime = 0,
      totalResults = 0,
      pages = 0,
      query = "",
      currentPage = state.currentPage;

    if (typeof res.items !== "undefined" && res.items && res.items.length > 0) {
      currentResults = [...res.items];
    }

    if (
      typeof res.queries !== "undefined" &&
      typeof res.queries.request !== "undefined" &&
      res.queries.request.length > 0
    ) {
      query = res.queries.request[0].searchTerms;
      currentPage = reverseIndex(res.queries.request[0].startIndex);
    }

    if (
      typeof res.queries.nextPage !== "undefined" &&
      res.queries.nextPage &&
      res.queries.nextPage.length > 0
    ) {
      nextPage = res.queries.nextPage[0].startIndex;
    }

    if (
      typeof res.queries.previousPage !== "undefined" &&
      res.queries.previousPage &&
      res.queries.previousPage.length > 0
    ) {
      prevPage = res.queries.previousPage[0].startIndex;
    }

    if (
      typeof res.searchInformation.formattedSearchTime !== "undefined" &&
      res.searchInformation.formattedSearchTime
    ) {
      searchTime = res.searchInformation.formattedSearchTime;
    }

    if (
      typeof res.searchInformation.formattedTotalResults !== "undefined" &&
      res.searchInformation.formattedTotalResults
    ) {
      totalResults = res.searchInformation.formattedTotalResults;
      pages = Math.round(res.searchInformation.totalResults / 10);
    }

    _setState({
      currentResults,
      nextPage,
      prevPage,
      searchTime,
      totalResults,
      pages,
      currentPage,
      query,
    });

    return;
  };

  /**
   *   -----------------------------------------------------------------------------
   *   5: Search Website Method.
   *   Description: Series of tests before setting state and rendering.
   *   @public
   *   @param {String} query
   *   -----------------------------------------------------------------------------
   */

  this._searchSite = (query) => {
    const { baseUrl, apiKey, cx } = state;

    // Checking for null and undefined
    const types = [typeof baseUrl, typeof apiKey, typeof cx];

    if (types.includes("undefined") || types.includes(null)) {
      console.warn("Type Error: Check your api key and search engine id.");
      return;
    }

    fetch(`${baseUrl}?key=${apiKey}&cx=${cx}&q=${query}`)
      .then((res) => res.json())
      .then((res) => _purifyResponse(res, query))
      .catch((error) => {
        console.warn(`Error Has Occured: ${error}`);
        // Reset the page to ensure nothing breaks on error
        _setState(initialState);
        return;
      });
  };

  /**
   *   -----------------------------------------------------------------------------
   *   6: Pagination Method.
   *   Description: This method takes a start index to query next page results.
   *   @public
   *   @param {Number} start
   *   -----------------------------------------------------------------------------
   */

  this._paginate = (start) => {
    if (start) {
      const { baseUrl, apiKey, cx } = state;

      // Calculates the following sequence 11, 21, 31, 41, 51 etc
      let startIndex = 1 + (start - 1) * 10;
      // Google only allows the first 10 pages of results
      if (start > 10) {
        startIndex = 91;
      }

      fetch(
        `${baseUrl}?key=${apiKey}&cx=${cx}&q=${state.query}&start=${startIndex}`
      )
        .then((res) => res.json())
        .then((res) => _purifyResponse(res))
        .catch((error) => {
          // Reset the page to ensure nothing breaks on error
          _setState(initialState);
          console.warn(`Error Has Occured: ${error}`);
          return;
        });
    }

    return;
  };

  /**
   *   -----------------------------------------------------------------------------
   *   7: Render Search Results Method.
   *   Description: This method uses the el function to template out the search data.
   *   @public
   *   -----------------------------------------------------------------------------
   */

  this._render = () => {
    // Make sure we have el template function in _helpers.js
    if (typeof el !== "function") {
      console.warn(
        "el template function not found. Add to _assets/js/libs/_helpers.js."
      );
      return;
    }

    // Check that we're on the search page before we try to render anything
    if (
      document.querySelector("#google-results") === null ||
      !document.querySelector("#google-results")
    ) {
      console.warn("No Search Results Element.");
      console.warn('Not Found: <div id="google-results"></div>');
      return;
    }

    // Container for displaying results list
    const resultsContainer = document.querySelector("#google-results");

    if (
      document.querySelector("#google-total-results") === null ||
      !document.querySelector("#google-total-results")
    ) {
      console.warn("No Total Results Element.");
      console.warn('Not Found: <div id="google-total-results"></div>');
      return;
    }

    const formatedTotalResults = document.querySelector("#google-total-results");

    if (
      document.querySelector("#google-pagination") === null ||
      !document.querySelector("#google-pagination")
    ) {
      console.warn("No Pagination Element.");
      console.warn('Not Found: <div id="google-pagination"></div>');
      return;
    }

    const paginationContainer = document.querySelector("#google-pagination");

    // Check results container for firstChild
    // Keep removing it until div has no children
    while (resultsContainer.firstChild) {
      resultsContainer.removeChild(resultsContainer.firstChild);
    }

    // While pagination container has a first child delete it.
    // From my experience this is a really clean way to clear nodes.
    while (paginationContainer.firstChild) {
      paginationContainer.removeChild(paginationContainer.firstChild);
    }

    // Make sure we have something to display
    // If not we'll display a no results message
    if (state.currentResults.length <= 0) {
      resultsContainer.appendChild(el("h3", {}, "No Search Results"));
      formatedTotalResults.innerHTML = `${state.totalResults} results (${
        state.searchTime
      } seconds)`;
      return;
    } else {
      formatedTotalResults.innerHTML = `${state.totalResults} results (${
        state.searchTime
      } seconds)`;
    }

    // Single Search Result
    const singleResult = (result) => {
      return el(
        "li",
        { className: "google-list-item" },
        el(
          "a",
          { href: result.link, className: "google-list-link" },
          `${result.title}`
        ),
        el("p", { className: "google-list-url" }, `${result.formattedUrl}`),
        el("p", { className: "google-list-snippet" }, `${result.snippet}`)
      );
    };

    // All Search Results
    const allResults = el(
      "ul",
      { className: "google-list" },
      state.currentResults.map(singleResult)
    );

    // Pagination back button handler.
    const handleBack = () => {
      const { prevPage } = state;

      if (prevPage !== null) {
        this._paginate(reverseIndex(prevPage));
      }

      return false;
    };

    // Pagination forward button handler.
    const handleForward = () => {
      const { nextPage } = state;

      if (nextPage !== null) {
        this._paginate(reverseIndex(nextPage));
      }

      return false;
    };

    // Pagination Numbered Links
    const changePage = (ev) => {
      ev.preventDefault();
      // Page number is added as name in singlePage const
      const start = Number(ev.target.name);
      this._paginate(start);
      return;
    };

    const singlePage = (page) => {
      if (page.tagName === "IMG") {
        return el(
          "li",
          { className: "google-pagination-item google-pagination-control" },
          el("a", { href: "#" }, page)
        );
      }
      if (page.tagName === "P") {
        return el("li", { className: "google-cse-current-page" }, page);
      }
      return el(
        "li",
        {
          className: `google-pagination-item ${
            page === state.currentPage ? "google-current-page-highlight" : ""
          }`,
        },
        el(
          "a",
          {
            onclick: changePage,
            name: `${page}`,
            href: "#",
          },
          `${page}`
        )
      );
    };

    const pageWrapper = (results) =>
      el("ul", { className: "google-pagination-list" }, results.map(singlePage));

    let pageButtons = [];
    // Google only allows 100 results so we're limiting to 10 pages
    let endPage = state.pages > 10 ? 10 : state.pages;

    for (let i = 0; i < endPage; i++) {
      pageButtons = [...pageButtons, i + 1];
      // ex: pageButtons =  [1, 2, 3, 4, 5]
    }

    // Back Button Added To Begining of Buttons Array
    if (state.pages > 1) {
      pageButtons.splice(
        0,
        0,
        el("img", {
          onclick: handleBack,
          style: "transform: rotate(180deg);",
          src:
            "https://res.cloudinary.com/highereducation/image/upload/v1555612633/icons/icon-arrow-right.svg",
          height: "10",
        })
      );

      // Adding one page displayed for mobile
      pageButtons.splice(1, 0, el("p", {}, `${state.currentPage}`));

      // Next Page Button Added To End Of Button Array
      pageButtons.splice(
        pageButtons.length,
        0,
        el("img", {
          onclick: handleForward,
          src:
            "https://res.cloudinary.com/highereducation/image/upload/v1555612633/icons/icon-arrow-right.svg",
          height: "10",
          className: "google-cse-nav",
        })
      );
    }

    // Appending Buttons and results
    resultsContainer.appendChild(allResults);
    paginationContainer.appendChild(pageWrapper(pageButtons));
    return;
  };
}

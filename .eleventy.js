const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // Static passthroughs
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  // Human readable date filter, e.g. "Saturday, September 12, 2026"
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(new Date(dateObj), { zone: "utc" }).toFormat(
      "cccc, LLLL d, yyyy"
    );
  });

  // Short date for meta / cards
  eleventyConfig.addFilter("shortDate", (dateObj) => {
    return DateTime.fromJSDate(new Date(dateObj), { zone: "utc" }).toFormat("LLL d, yyyy");
  });

  // Plain YYYY-MM-DD, used for the sitemap's <lastmod>
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return DateTime.fromJSDate(new Date(dateObj), { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Episodes collection: everything in src/episodes, newest first
  eleventyConfig.addCollection("episodes", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/episodes/*.md").sort((a, b) => {
      return new Date(b.data.date) - new Date(a.data.date);
    });
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};

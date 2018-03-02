const request = require("request");
const cheerio = require("cheerio");
const SIGNATURE = require("./signature");

const opened = async (context, awesomeMobxSource) => {
  const { login: author } = context.payload.sender;
  const { body: issueBody } = context.payload.issue;

  // Find the link in the issue comment, or stop listening if no link was found
  let link;
  const linkRegex = /(https?:\/\/.+)/g;
  let m = linkRegex.exec(issueBody); // Regex match object
  if (m) {
    link = m[1];
  } else {
    // No link? no op
    return;
  }

  // Check for duplicate links
  let regex = new RegExp(link.replace("/", "\\/"));
  // If we have a match, the link exists; its a duplicate, so close the issue
  if (regex.exec(awesomeMobxSource) !== null) {
    // Comment on the issue
    const paramsToComment = context.issue({
      body: `Hey, thanks so much for suggesting that link! :+1:

Turns out we've already got that link in the list, so I'm closing this issue since it's a duplicate. Thanks so much though! :raised_hands:
${SIGNATURE}
`
    });
    const paramsToClose = context.issue({ state: "closed" });

    context.github.issues.createComment(paramsToComment);
    return context.github.issues.edit(paramsToClose);
  }

  // Now lets find out the resource's name
  request(link, (err, res, body) => {
    if (err) {
      // TODO: Request the user check the link
      console.error(err);
      return;
    }

    // Add the resource, but first we need the name
    let $ = cheerio.load(body);

    // Hoping most blog sites have decent opengraph support
    let title = $('meta[property="og:title"]').attr("content");

    if (!title) {
      const params = context.issue({
        body: `Hi there!

      Thanks for suggesting that link! Unfortunately, I couldn't find the title of the link.

      cc @hawkins
      ${SIGNATURE}
      `
      });

      // Comment on the issue
      return context.github.issues.createComment(params);
    }

    // Determine the type of link (article, tutorial, video etc) where possible
    let resourceType = "unknown";

    // BLOGS determined by og:type=article
    const ogType = $('meta[property="og:type"]').attr("content");
    if (ogType == "article") resourceType = "blog";

    // CASE STUDIES determined by "How we use" "How ${COMPANY} use"
    const caseStudyRegex = /(how\swe\suse|how\s[^\s]*\suse)/i;
    m = caseStudyRegex.exec(title);
    if (m) resourceType = "case study";

    // TUTORIALS determined if the title has these strings: "how to" "introduction" "tutorial"
    const tutorialRegex = /(how\sto|intro|tutorial)/i;
    m = tutorialRegex.exec(title);
    if (m) resourceType = "tutorial";

    // COMPARISONS determined if the title has these strings: "redux", "vs.", "versus"
    const comparisonRegex = /(redux|\svs\.?\s|versus)/i;
    m = comparisonRegex.exec(title);
    if (m) resourceType = "comparison";

    // VIDEOS determined if the link points to Youtube, Vimeo, *.tv
    const videosRegex = /(https?:\/\/)?(youtube\.com|.*\.tv|vimeo\.com)/i;
    m = videosRegex.exec(link);
    if (m) resourceType = "video";

    const params = context.issue({
      body: `Hi there!

Thanks for suggesting that link! We found the following details for your link:

- [${title}](${link}) (${resourceType})
${SIGNATURE}
`
    });

    // Comment on the issue
    return context.github.issues.createComment(params);
  });
};

module.exports = {
  opened
};

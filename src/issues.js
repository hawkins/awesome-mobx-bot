const request = require("request-promise-native");
const cheerio = require("cheerio");
const SIGNATURE = require("./signature");
const { getSourceIndex } = require("./tools");
const gitdata = require("./gitdata");

const opened = async (context, awesomeMobxSource) => {
  const { owner, repo } = context.repo();

  const { login: author } = context.payload.sender;
  const { body: issueBody, number: issueNumber } = context.payload.issue;

  /*
   * Find the link in the issue comment
   */
  let link;
  const linkRegex = /(https?:\/\/.+)/g;
  let m = linkRegex.exec(issueBody);
  if (m) {
    link = m[1];
  } else {
    // No link? Don't worry about this Issue then
    return;
  }

  /*
   * Check for duplicate links
   */
  let regex = new RegExp(link.replace("/", "\\/"));
  if (regex.exec(awesomeMobxSource) !== null) {
    const paramsToComment = context.issue({
      body: `Hey, thanks so much for suggesting that link! :+1:

Turns out we've already got that link in the list, so I'm closing this issue since it's a duplicate. Thanks so much though! :raised_hands:
${SIGNATURE}
`
    });
    const paramsToClose = context.issue({ state: "closed" });

    // Comment on and close the issue
    context.github.issues.createComment(paramsToComment);
    return context.github.issues.edit(paramsToClose);
  }

  /*
   * Find the resource's name
   */
  const body = await request(link);
  let $ = cheerio.load(body);
  let title = $('meta[property="og:title"]').attr("content");
  if (!title) {
    const params = context.issue({
      body: `Hi there!

      Thanks for suggesting that link!
      Unfortunately, I couldn't find the title of the link, so I'll need a human to open a PR with the link.

      (This may be a bug in my code! cc @hawkins)
      ${SIGNATURE}
      `
    });

    return context.github.issues.createComment(params);
  }

  /*
   * Determine the type of link
   * (article, tutorial, video etc) where possible
   *
   * BLOGS determined by og:type=article
   * CASE STUDIES determined by "How we use" "How ${COMPANY} use"
   * TUTORIALS determined if the title has these strings: "how to" "introduction" "tutorial"
   * COMPARISONS determined if the title has these strings: "redux", "vs.", "versus"
   * VIDEOS determined if the link points to Youtube, Vimeo, *.tv
   */
  let resourceType = "unknown";

  const ogType = $('meta[property="og:type"]').attr("content");
  if (ogType == "article") resourceType = "Blogs";

  const caseStudyRegex = /(how\swe\suse|how\s[^\s]*\suse)/i;
  m = caseStudyRegex.exec(title);
  if (m) resourceType = "Case studies";

  const tutorialRegex = /(how\sto|intro|tutorial)/i;
  m = tutorialRegex.exec(title);
  if (m) resourceType = "Tutorials";

  const comparisonRegex = /(redux|\svs\.?\s|versus)/i;
  m = comparisonRegex.exec(title);
  if (m) resourceType = "Comparisons with other state management libraries";

  const videosRegex = /(https?:\/\/)?(youtube\.com|.*\.tv|vimeo\.com)/i;
  m = videosRegex.exec(link);
  if (m) resourceType = "Videos";

  // Find where to add the link to the file
  const { index, length } = getSourceIndex(awesomeMobxSource, resourceType);
  awesomeMobxSource =
    awesomeMobxSource.slice(0, index + length) +
    `\n* [${title}](${link})` +
    awesomeMobxSource.slice(index + length);

  /*
   * Create a commit
   */
  const commitMessage = await gitdata.updateFiles(
    context,
    owner,
    repo,
    awesomeMobxSource,
    issueNumber,
    title,
    author
  );

  /*
   * Open a PR for the branch
   */
  await gitdata.openPR(
    context,
    owner,
    repo,
    commitMessage,
    title,
    link,
    resourceType,
    issueNumber
  );
};

module.exports = {
  opened
};

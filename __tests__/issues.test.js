const { opened } = require("../src/issues");

const fixture = require("./fixtures/issue_link_primitive.json");

const awesomeMobXSource = `
# mock source code

- [link](https://example.com) - cool link!
`;

describe("issues", () => {
  describe("opened", () => {
    let context;

    beforeEach(() => {
      // This is an easy way to mock out the GitHub API
      context = {
        payload: fixture.payload,
        issue: jest.fn().mockReturnValue({}),
        github: {
          issues: {
            createComment: jest.fn().mockReturnValue(
              Promise.resolve({
                // TODO: Pull this from fixtures
              })
            )
          }
        }
      };
    });

    test("open an issue with a link and some text", async () => {
      await opened(context, awesomeMobXSource);
      // TODO: Inspect call to github.issues.createComment
    });
  });
});

const { createRobot } = require("probot");
const app = require("..");
const newLinkPayload = require("./fixtures/issue_new_link.json");
const existingLinkPayload = require("./fixtures/issue_existing_link.json");

const awesomeMobXSource = `
# mock source code

- [link](https://example.com/) - cool link!
`;

describe("issues", () => {
  let robot;
  let github;

  beforeEach(() => {
    robot = createRobot();
    app(robot, awesomeMobXSource);

    github = {
      issues: {
        createComment: jest.fn(),
        edit: jest.fn()
      },
      pullRequests: {
        create: jest.fn().mockReturnValue({
          data: {
            html_url: "https://example.com/1",
            number: 4
          }
        })
      },
      gitdata: {
        getReference: jest.fn().mockReturnValue({
          data: {
            object: {
              sha: "01"
            }
          }
        }),
        createBlob: jest.fn().mockReturnValue({
          data: {
            sha: "a2",
            url: "https://example.com/2"
          }
        }),
        getTree: jest.fn().mockReturnValue({
          data: {
            sha: "b1"
          }
        }),
        createTree: jest.fn().mockReturnValue({
          data: {
            sha: "b2"
          }
        }),
        createCommit: jest.fn().mockReturnValue({
          data: {
            sha: "c2"
          }
        }),
        createReference: jest.fn().mockReturnValue({
          data: {
            ref: "heads/bot/issue-3"
          }
        })
      }
    };

    // Passes the mocked out GitHub API into out robot instance
    robot.auth = () => Promise.resolve(github);
  });

  it("when opened with a new link", async () => {
    await robot.receive(newLinkPayload);
    expect(github.issues.createComment).toMatchSnapshot();
    expect(github.gitdata.createBlob).toMatchSnapshot();
    expect(github.gitdata.createCommit).toMatchSnapshot();
    expect(github.pullRequests.create).toMatchSnapshot();
  });

  it("when opened with an existing link", async () => {
    await robot.receive(existingLinkPayload);
    expect(github.issues.createComment).toMatchSnapshot();
    expect(github.issues.edit).toMatchSnapshot();
  });
});

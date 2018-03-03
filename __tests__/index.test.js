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
      }
    };

    // Passes the mocked out GitHub API into out robot instance
    robot.auth = () => Promise.resolve(github);
  });

  it("when opened with a new link", async () => {
    await robot.receive(newLinkPayload);
    expect(github.issues.createComment).toHaveBeenCalled();
  });

  it("when opened with an existing link", async () => {
    await robot.receive(existingLinkPayload);
    expect(github.issues.createComment).toHaveBeenCalled();
    expect(github.issues.edit).toHaveBeenCalledWith({
      number: 3,
      owner: "hawkins",
      repo: "awesome-mobx-bot",
      state: "closed"
    });
  });
});

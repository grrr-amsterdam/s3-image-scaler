const isValidExtension = require("../util/isValidExtension");
describe("Given a URL with unsupported extension", () => {
  it("Will return false", () => {
    expect(isValidExtension("docx")).toBe(false);
  });
});
describe("Given a URL with a supported extension", () => {
  it("Will return true", () => {
    expect(isValidExtension("jpg")).toBe(true);
  });
});

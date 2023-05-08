const getInputFormat = require("../util/getInputFormat.js");

it("Return the right input format", function () {
  expect(getInputFormat("foo.jpg")).toBe("jpg");
  expect(getInputFormat("foo.jpg.png")).toBe("png");
  expect(getInputFormat("foo.jpg.png", "png")).toBe("jpg");
});

const getOutputFormat = require("../util/getOutputFormat");

it("should return the right output format", function () {
  expect(getOutputFormat("foo.jpg.png")).toBe("png");
  expect(getOutputFormat("foo.jpg")).toBe("jpg");
  expect(getOutputFormat("foo.jpg.png", "png")).toBe("png");
  expect(getOutputFormat("foo.jpg.jpg", "jpg")).toBe("jpg");
  expect(getOutputFormat("foo.jpg", "jpg")).toBe("jpg");

  expect(() => getOutputFormat("foo.jpg.png", "jpg")).toThrow(
    new Error(
      "The filename 'foo.jpg.png' must have 'jpg' as extension, not 'png'."
    )
  );
});

const pathToParams = require("../util/pathToParams.js");

describe("pathToParams", () => {
  describe("Given a URL with unsupported extension", () => {
    it("Will throw an error", () => {
      const input = "500x320/foo.jpg";
      expect(() => pathToParams(input, ["png"])).toThrow(
        "Unable to produce output jpg."
      );
    });
  });

  describe("Given a URL with both dimensions and no output-format", () => {
    it("Will extract dimensions and use the original extension as outputFormat", () => {
      const input = "500x320/foo.jpg";
      const [size, path, outputFormat, originalExtension] = pathToParams(
        input,
        ["jpg"]
      );
      expect(size).toBe("500x320");
      expect(path).toBe("foo.jpg");
      expect(outputFormat).toBe("jpeg");
      expect(originalExtension).toBe("jpg");
    });
  });
  describe("Given a URL with just a width", () => {
    it("Will still extract the dimensions", () => {
      const input = "/500x/foo.jpg";
      const [size, path, outputFormat, originalExtension] = pathToParams(
        input,
        ["jpg"]
      );
      expect(size).toBe("500x");
      expect(path).toBe("foo.jpg");
      expect(outputFormat).toBe("jpeg");
      expect(originalExtension).toBe("jpg");
    });
  });
  describe("Given a URL with just a height", () => {
    it("Will still extract the dimensions", () => {
      const input = "/x500/foo.jpg";
      const [size, path, outputFormat, originalExtension] = pathToParams(
        input,
        ["jpg"]
      );
      expect(size).toBe("x500");
      expect(path).toBe("foo.jpg");
      expect(outputFormat).toBe("jpeg");
      expect(originalExtension).toBe("jpg");
    });
  });
  describe("Given a URL with a longer directory path", () => {
    it("Will extract the correct path", () => {
      const input = "/500x500/my/deeper/folder/foo.jpg";
      const [size, path, outputFormat, originalExtension] = pathToParams(
        input,
        ["jpg"]
      );
      expect(size).toBe("500x500");
      expect(path).toBe("my/deeper/folder/foo.jpg");
      expect(outputFormat).toBe("jpeg");
      expect(originalExtension).toBe("jpg");
    });
  });
  describe("Given a file with a double extension", () => {
    it("Will treat the first extension as part of the original filename, and the last part as the outputFormat", () => {
      const input = "/300x120/foo.jpg.png";
      const [size, path, outputFormat, originalExtension] = pathToParams(
        input,
        ["jpg", "png"]
      );
      expect(size).toBe("300x120");
      expect(path).toBe("foo.jpg");
      expect(outputFormat).toBe("png");
      expect(originalExtension).toBe("jpg");
    });
    it("Will only look at double extensions if they're both in the allowed list.", () => {
      const input = "/300x120/foo.zip.jpg";
      const [size, path, outputFormat, originalExtension] = pathToParams(
        input,
        ["jpg"]
      );
      expect(size).toBe("300x120");
      expect(path).toBe("foo.zip.jpg");
      expect(outputFormat).toBe("jpeg");
      expect(originalExtension).toBe("jpg");
    });
  });
});

const getInputFormat = require("../util/getInputFormat.js");
const getOutputFormat = require("../util/getOutputFormat.js");
const pathToParams = require("../util/pathToParams.js");

describe("pathToParams", () => {
  describe("Given a URL with both dimensions and no output-format", () => {
    it("Will extract dimensions and use the original extension as outputFormat", () => {
      const input = "scaled/width:500_height:320/foo.jpg";
      const [options, path] = pathToParams(input);
      expect(options.width).toBe("500");
      expect(options.height).toBe("320");
      expect(path).toBe("foo.jpg");
    });
  });
  describe("Given a URL with just a width", () => {
    it("Will still extract the dimensions", () => {
      const input = "/scaled/width:500/foo.jpg";
      const [options, path] = pathToParams(input);
      expect(options.width).toBe("500");
      expect(options.height).toBeUndefined();
      expect(path).toBe("foo.jpg");
    });
  });
  describe("Given a URL with just a height", () => {
    it("Will still extract the dimensions", () => {
      const input = "/scaled/height:500/foo.jpg";
      const [options, path] = pathToParams(input);
      expect(options.width).toBeUndefined();
      expect(options.height).toBe("500");
      expect(path).toBe("foo.jpg");
    });
  });
  describe("Given a URL with a longer directory path", () => {
    it("Will extract the correct path", () => {
      const input = "/scaled/width:500_height:500/my/deeper/folder/foo.jpg";
      const [options, path] = pathToParams(input, ["jpg"]);
      expect(options.width).toBe("500");
      expect(options.height).toBe("500");
      expect(path).toBe("my/deeper/folder/foo.jpg");
    });
  });
  describe("Given a file with a double extension", () => {
    it("Will treat the first extension as part of the original filename, and the last part as the outputFormat", () => {
      const input = "/scaled/width:300_height:120_convert:png/foo.jpg.png";
      const [options, path] = pathToParams(input);
      const inputFormat = getInputFormat(path, options.convert);
      const outputFormat = getOutputFormat(path, options.convert);
      expect(options.width).toBe("300");
      expect(options.height).toBe("120");
      expect(path).toBe("foo.jpg.png");
      expect(outputFormat).toBe("png");
      expect(inputFormat).toBe("jpg");
    });
    it("Will be able to handle repeating extensions.", () => {
      const input = "/scaled/width:300_height:120/foo.jpg.jpg";
      const [options, path] = pathToParams(input);
      expect(options.width).toBe("300");
      expect(options.height).toBe("120");
      expect(path).toBe("foo.jpg.jpg");
    });
  });
});

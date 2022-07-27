const toSharpOptions = require("../util/toSharpOptions.js");

describe("toSharpOptions", () => {
  describe("Given a width and height", () => {
    it("Will leave the options alone", () => {
      const options = {
        width: 500,
        height: 500,
        fit: "cover",
      };
      expect(toSharpOptions(options)).toBe(options);
    });
  });
  describe("Given falsey width", () => {
    it("Will remove the width property", () => {
      const options = {
        width: 0,
        height: 500,
        fit: "cover",
      };
      const expectedOutput = {
        height: 500,
        fit: "cover",
      };
      expect(toSharpOptions(options)).toStrictEqual(expectedOutput);
    });
  });
  describe("Given falsey height", () => {
    it("Will remove the height property", () => {
      const options = {
        width: 500,
        height: 0,
        fit: "cover",
      };
      const expectedOutput = {
        width: 500,
        fit: "cover",
      };
      expect(toSharpOptions(options)).toStrictEqual(expectedOutput);
    });
  });
});

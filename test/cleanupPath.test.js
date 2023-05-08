const cleanupPath = require("../util/cleanupPath");

describe("cleanup path", () => {
  describe("Given a path with a leading slash", () => {
    it("it will remove it", () => {
      const output = cleanupPath("/test");
      expect(output).toEqual("test");
    });
    it("it will preserve subfolders", () => {
      const output = cleanupPath("/test/subfolder");
      expect(output).toEqual("test/subfolder");
    });
  });
});

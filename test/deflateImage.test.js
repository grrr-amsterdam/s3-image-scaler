const fs = require("fs");
const deflateImage = require("../util/deflate-image.js");

describe("deflateImage", () => {
  describe("Given a Gzipped image", () => {
    it("Will generate a correct jpeg", async () => {
      const input = fs.readFileSync(
        __dirname + "/fixtures/zipped-image.jpg.gz"
      );
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/unzipped-image.jpg"
      );
      const output = await deflateImage(input);
      expect(output).toEqual(expectedOutput);
    });
  });
});

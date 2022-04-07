const fs = require("fs");
const resizeImage = require("../util/resizeImage.js");

describe("resizeImage", () => {
  describe("Given 500x500 dimensions", () => {
    it("Will resize the given PNG image", async () => {
      const options = {
        width: 500,
        height: 500,
        fit: "contain",
      };
      const input = fs.readFileSync(__dirname + "/fixtures/pixelme.png");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/pixelme500x500.png"
      );
      const output = await resizeImage(input, "png", options);
      expect(output).toStrictEqual(expectedOutput);
    });

    it("Will resize the given JPG image", async () => {
      const options = {
        width: 500,
        height: 500,
        fit: "contain",
      };
      const input = fs.readFileSync(__dirname + "/fixtures/belltower.jpg");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/belltower500x500.jpg"
      );
      const output = await resizeImage(input, "jpg", options);
      expect(output).toStrictEqual(expectedOutput);
    });
  });

  describe("Given 5x5 dimensions", () => {
    it("Will resize the given image", async () => {
      const options = {
        width: 5,
        height: 5,
        fit: "contain",
      };
      const input = fs.readFileSync(__dirname + "/fixtures/pixelme.png");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/pixelme5x5.png"
      );
      const output = await resizeImage(input, "png", options);
      expect(output).toStrictEqual(expectedOutput);
    });
  });

  describe("Given 50x dimensions", () => {
    it("Will resize the given image", async () => {
      const options = {
        width: 50,
        fit: "contain",
      };
      const input = fs.readFileSync(__dirname + "/fixtures/pixelme.png");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/pixelme50x.png"
      );
      const output = await resizeImage(input, "png", options);
      expect(output).toStrictEqual(expectedOutput);
    });
  });

  describe("Given an image with Orientation header", () => {
    /**
     * We need this header intact because otherwise the output image might appear upside-down,
     * whereas a browser would respect the header and show the image right-side-up.
     */
    it("Will make sure the Orientation header stays intact", async () => {
      const options = {
        width: 240,
        fit: "contain",
      };
      const input = fs.readFileSync(
        __dirname + "/fixtures/with-orientation-header.jpg"
      );
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/with-orientation-header240x.jpg"
      );
      const output = await resizeImage(input, "jpeg", options);
      expect(output).toStrictEqual(expectedOutput);
    });
  });

  describe("Given a JFIF image", () => {
    it("Will generate a correct jpeg image", async () => {
      const options = {
        width: 160,
        fit: "contain",
      };
      const input = fs.readFileSync(__dirname + "/fixtures/sample.jfif");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/sample160x.jfif"
      );
      const output = await resizeImage(input, "jpeg", options);
      expect(output).toStrictEqual(expectedOutput);
    });
  });

  describe("Given a JPEG image, while requesting WebP output", () => {
    it("Will generate a correct webp image", async () => {
      const options = {
        width: 800,
        fit: "contain",
      };
      const input = fs.readFileSync(__dirname + "/fixtures/drawing.jpg");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/drawing.webp"
      );
      const output = await resizeImage(input, "webp", options);
      expect(output).toStrictEqual(expectedOutput);
    });
  });
});

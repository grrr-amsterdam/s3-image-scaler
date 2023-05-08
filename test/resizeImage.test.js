const fs = require("fs");
const resizeImage = require("../util/resizeImage.js");

describe("resizeImage", () => {
  describe("Given 500x500 dimensions", () => {
    it("Will resize the given PNG image", async () => {
      const input = fs.readFileSync(__dirname + "/fixtures/pixelme.png");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/pixelme500x500.png"
      );
      const output = await resizeImage(input, "png", "png", 500, 500);
      expect(output.equals(expectedOutput)).toBe(true);
    });

    it("Will resize the given JPG image", async () => {
      const input = fs.readFileSync(__dirname + "/fixtures/belltower.jpg");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/belltower500x500.jpg"
      );
      const output = await resizeImage(input, "jpg", "jpg", 500, 500);
      expect(output.equals(expectedOutput)).toBe(true);
    });
  });

  describe("Given 5x5 dimensions", () => {
    it("Will resize the given image", async () => {
      const input = fs.readFileSync(__dirname + "/fixtures/pixelme.png");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/pixelme5x5.png"
      );
      const output = await resizeImage(input, "png", "png", 5, 5);
      expect(output.equals(expectedOutput)).toBe(true);
    });
  });

  describe("Given 50x dimensions", () => {
    it("Will resize the given image", async () => {
      const input = fs.readFileSync(__dirname + "/fixtures/pixelme.png");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/pixelme50x.png"
      );
      const output = await resizeImage(input, "png", "png", 50);
      expect(output.equals(expectedOutput)).toBe(true);
    });
  });

  describe("Given an image with Orientation header", () => {
    /**
     * We need this header intact because otherwise the output image might appear upside-down,
     * whereas a browser would respect the header and show the image right-side-up.
     */
    it("Will make sure the Orientation header stays intact", async () => {
      const input = fs.readFileSync(
        __dirname + "/fixtures/with-orientation-header.jpg"
      );
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/with-orientation-header240x.jpg"
      );
      const output = await resizeImage(input, "jpg", "jpg", 240);
      expect(output.equals(expectedOutput)).toBe(true);
    });
  });

  describe("Given a JFIF image", () => {
    it("Will generate a correct jpeg image", async () => {
      const input = fs.readFileSync(__dirname + "/fixtures/sample.jfif");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/sample160x.jfif"
      );
      const output = await resizeImage(input, "jfif", "jfif", 160);
      expect(output.equals(expectedOutput)).toBe(true);
    });
  });

  describe("Given a JPEG image, while requesting WebP output", () => {
    it("Will generate a correct webp image", async () => {
      const input = fs.readFileSync(__dirname + "/fixtures/drawing.jpg");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/drawing.webp"
      );
      const output = await resizeImage(input, "jpg", "webp", 800);
      expect(output.equals(expectedOutput)).toBe(true);
    });
  });

  describe("Given an SVG image", () => {
    it("Will config to a correct png image", async () => {
      const input = fs.readFileSync(__dirname + "/fixtures/transparent.svg");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/transparent.png"
      );
      const output = await resizeImage(input, "svg", "png", 160);
      expect(output.equals(expectedOutput)).toBe(true);
    });
    it("Won't resize", async () => {
      const input = fs.readFileSync(__dirname + "/fixtures/transparent.svg");
      const output = await resizeImage(input, "svg", "svg", 160);
      expect(output.equals(input)).toBe(true);
    });
  });

  describe("Give a transparent PNG file", () => {
    it("Will preserve the transparency", async () => {
      const input = fs.readFileSync(__dirname + "/fixtures/transparent.png");
      const expectedOutput = fs.readFileSync(
        __dirname + "/fixtures/transparent50x.png"
      );
      const output = await resizeImage(input, "png", "png", 50);
      expect(output.equals(expectedOutput)).toBe(true);
    });
  });
});

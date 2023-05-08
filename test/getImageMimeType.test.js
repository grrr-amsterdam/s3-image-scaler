const getImageMimeType = require("../util/getImageMimeType.js");

it("Uses the extension of the filename to determine mimetype", () => {
  expect(getImageMimeType(".jpeg")).toBe("image/jpeg");
  expect(getImageMimeType(".jpg")).toBe("image/jpeg");
  expect(getImageMimeType(".svg")).toBe("image/svg+xml");
});

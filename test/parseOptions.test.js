const parseOptions = require("../util/parseOptions.js");

it("should parse the options", function () {
  expect(parseOptions("width:100")).toEqual({ width: "100" });
  expect(parseOptions("width:100_height:200")).toEqual({
    width: "100",
    height: "200",
  });
  expect(parseOptions("")).toEqual({});
  expect(parseOptions("convert:jpg,png")).toEqual({ convert: "jpg,png" });
  expect(parseOptions("foo:bar")).toEqual({ foo: "bar" });
});

const { promisify } = require("util");
const zlib = require("zlib");

const deflate = promisify(zlib.gunzip);

module.exports = async (body) => {
  return await deflate(body);
};

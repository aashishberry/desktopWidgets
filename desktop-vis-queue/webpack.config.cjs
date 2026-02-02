const path = require("path");

const config = {
  mode: "production",
  entry: "./src/desktop-vis-queue.js",
  output: {
    path: path.resolve(__dirname, "src/build"),
    filename: "desktop-vis-queue.js",
    publicPath: "build/"
  },
  module: {
    rules: [
      {
        use: "babel-loader",
        test: /\.js$/
      }
    ]
  }
};

module.exports = config;

const path = require("path");

const config = {
  mode: "production",
  entry: "./src/desktop-ring-v2.js",
  output: {
    path: path.resolve(__dirname, "src/build"),
    filename: "desktop-ring-v2.js",
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

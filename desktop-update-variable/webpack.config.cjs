const path = require("path");

const config = {
  mode: "production",
  entry: "./src/desktop-update-variable.js",
  output: {
    path: path.resolve(__dirname, "src/build"),
    filename: "desktop-update-variable.js",
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

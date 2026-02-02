const path = require("path");

const config = {
  mode: "production",
  entry: "./src/desktop-agent-announcement.js",
  output: {
    path: path.resolve(__dirname, "src/build"),
    filename: "desktop-agent-announcement.js",
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

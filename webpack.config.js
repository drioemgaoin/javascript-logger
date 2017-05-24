module.exports = {
  entry: './src/logger.ts',
  output: {
    filename: 'logger.js',
    path: __dirname + '/build'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
};

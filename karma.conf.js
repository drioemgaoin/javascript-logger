module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    files: [
      'spec/**/*.spec.*',
      { pattern: 'lib/**/*', watched: true, included: false }
    ],
    singleRun: true
  });
};

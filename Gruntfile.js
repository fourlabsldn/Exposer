module.exports = function (grunt) {

  'use strict';
  grunt.initConfig({
    jshint: {
      all: ['src/**/*.js']
    },
    jscs: {
      src: 'src/**/*.js',
      options: {
        force: true,
        config: '.jscsrc',
        verbose: true, // If you need output with rule names http://jscs.info/overview.html#verbose
        fix: true, // Autofix code style violations when possible.
        requireCurlyBraces: ['if']
      }
    },
    jasmine: {
      src: 'src/**/*.js',
      options: {
        specs: 'tests/**/*.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.registerTask('default', ['jshint', 'jscs']);
  grunt.registerTask('test', ['jshint', 'jscs', 'jasmine']);
};

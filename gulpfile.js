"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var precss = require("precss");
var rename = require('gulp-rename');
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var autoprefixer = require("autoprefixer");
var mqpacker = require('css-mqpacker');
var csso = require('gulp-csso');
var del = require('del');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var run = require('run-sequence');
var server = require("browser-sync").create();

gulp.task('clean', function() {
  return del('build');
});

gulp.task('style:dev', function() {
  return gulp.src('postcss/style.css')
  .pipe(plumber())
  .pipe(postcss([
    precss(),
    autoprefixer({browsers: [
      'last 2 versions'
    ]})
  ]))
  .pipe(gulp.dest('css'))
  .pipe(server.stream());
});

gulp.task('style', function() {
  return gulp.src('postcss/style.css')
  .pipe(plumber())
  .pipe(postcss([
    precss(),
    mqpacker(),
    autoprefixer({browsers: [
      'last 2 versions'
    ]})
  ]))
  .pipe(csso())
  .pipe(gulp.dest('build/css'));
});

gulp.task('images', function() {
  return gulp.src('img/**/*.{png,jpg,gif}')
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true})
  ]))
  .pipe(gulp.dest('img'));
});
gulp.task('symbols', function() {
  return gulp.src('img/icons/*.svg')
  .pipe(svgmin())
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename('symbols.svg'))
  .pipe(gulp.dest('img'));
});


gulp.task("svg", function() {
  return gulp.src("img/*.svg")
  .pipe(svgmin())
  .pipe(gulp.dest("img"));
});

gulp.task('copy', function() {
  return gulp.src([
    'fonts/**/*.{woff,woff2}',
    'img/*.{svg,png,jpg,gif}',
    '*.html'
  ], {
    base: '.'
  })
  .pipe(gulp.dest('build'));
});

gulp.task('serve', ['style:dev', 'symbols'], function() {
  server.init({
    server: '.',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("postcss/**/*.css", ["style:dev"]);
  gulp.watch("*.html").on("change", server.reload);
});

gulp.task ("build", ["style", "svg","symbols"]);

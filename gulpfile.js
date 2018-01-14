"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var precss = require("precss");
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var csso = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var htmlmin = require("gulp-html-minifier2");
var concat = require("gulp-concat");
var del = require("del");
var run = require("run-sequence");
var uglify = require("gulp-uglify");
var ghPages = require("gulp-gh-pages");
var server = require("browser-sync").create();
var flexbugsFixes = require("postcss-flexbugs-fixes");
var sourcemaps = require("gulp-sourcemaps");
var sorting = require("postcss-sorting");
var sprites = require("postcss-sprites");
var critical = require("critical").stream;

gulp.task("clean", function() {
  return del("build");
});

gulp.task("clean:dev", function() {
  return del("js/main.js", "img/symbols.svg");
});

gulp.task("style", function() {
  return gulp
    .src("postcss/style.css")
    .pipe(plumber())
    .pipe(
      postcss([
        precss(),
        mqpacker({
          sort: false
        }),
        autoprefixer({
          browsers: ["last 2 versions"]
        }),
        flexbugsFixes()
      ])
    )
    .pipe(
      csso({
        restructure: true,
        sourceMap: false,
        debug: true,
        forceMediaMerge: true,
        structureMinimazation: true,
        comments: false
      })
    )
    .pipe(gulp.dest("build/css"));
});

gulp.task("style:dev", function() {
  var opts = {
    stylesheetPath: "./css",
    spritePath: "./img/sprite/",
    filterBy: function(image) {
      if (!/\/img\/sprite\//.test(image.url)) {
        return Promise.reject();
      }
      return Promise.resolve();
    }
  };
  var processors = [
    precss(),
    autoprefixer({
      browsers: ["last 4 versions"]
    }),
    flexbugsFixes(),
    sorting(),
    sprites(opts)
  ];
  return gulp
    .src("postcss/style.css")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.identityMap())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("css"))
    .pipe(plumber.stop())
    .pipe(server.stream());
});

gulp.task("htmlminify", function() {
  return gulp
    .src("build/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build/"));
});

gulp.task("jsmin", function() {
  return gulp
    .src(["js/utils.js", "js/map.js"])
    .pipe(concat("main.js"))
    .pipe(
      uglify({
        compress: {
          booleans: true,
          loops: true,
          unused: true,
          warnings: false,
          drop_console: true,
          unsafe: true,
          dead_code: true
        },
        output: {
          beautify: false,
          comments: false
        }
      })
    )
    .pipe(gulp.dest("build/js"));
});

gulp.task("concat:dev", function() {
  return gulp
    .src(["js/utils.js", "js/map.js"])
    .pipe(concat("main.js"))
    .pipe(gulp.dest("js"))
    .pipe(server.stream());
});

gulp.task("images", function() {
  return gulp
    .src("img/**/*.{png,jpg,gif}")
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.jpegtran({ progressive: true })
      ])
    )
    .pipe(gulp.dest("img"));
});

gulp.task("symbols:dev", function() {
  return gulp
    .src("img/icons/*.svg")
    .pipe(svgmin())
    .pipe(
      svgstore({
        inlineSvg: true
      })
    )
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("img/"));
});

gulp.task("symbols", function() {
  return gulp
    .src("img/icons/*.svg")
    .pipe(svgmin())
    .pipe(
      svgstore({
        inlineSvg: true
      })
    )
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("svg", function() {
  return gulp
    .src("img/*.svg")
    .pipe(svgmin())
    .pipe(gulp.dest("img/"));
});

gulp.task("copy", function() {
  return gulp
    .src(["fonts/*.{woff,woff2}", "img/*.{svg,png,jpg,gif}"], {
      base: "."
    })
    .pipe(gulp.dest("build"));
});

gulp.task("critical", function() {
  return gulp
    .src("./*.html")
    .pipe(
      critical({
        base: "./",
        inline: true,
        css: "build/css/style.css",
        minify: true,
        ignore: ["@font-face", /url\(/]
      })
    )
    .on("error", function(err) {
      gutil.log(gutil.colors.red(err.message));
    })
    .pipe(gulp.dest("build/"));
});

gulp.task("html:copy", function() {
  return gulp.src("*.html").pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function(done) {
  server.reload();
  done();
});

gulp.task(
  "serve",
  ["clean:dev", "style:dev", "concat:dev", "symbols:dev"],
  function() {
    server.init({
      server: ".",
      notify: false,
      open: true,
      cors: true,
      ui: false
    });

    gulp.watch("postcss/**/*.css", ["style:dev"]);
    gulp.watch("*.html", ["html:update"]);
  }
);

gulp.task("build", function(fn) {
  run("clean", ["copy", "style", "jsmin", "symbols"], "critical", "htmlminify", fn);
});

gulp.task("demo", function() {
  server.init({
    server: "build",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
});

gulp.task("deploy", function() {
  return gulp.src("./build/**/*").pipe(ghPages());
});

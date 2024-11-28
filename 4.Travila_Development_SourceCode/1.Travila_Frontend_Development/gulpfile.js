"use strict";

/** Declare module */
const { src, dest, parallel, watch, series } = require("gulp"),
    concat = require("gulp-concat"),
    sass = require("gulp-sass")(require("sass")),
    pug = require("gulp-pug"),
    autoprefixer = require("gulp-autoprefixer"),
    browserSync = require("browser-sync").create();

/** Files Path */
const FilesPath = {
    sassFiles: "src/assets/scss/*.scss",
    jsFiles: "src/assets/js/*.js",
    htmlFiles: "src/views/pages/*.pug"
};

const { sassFiles, jsFiles, htmlFiles } = FilesPath;

/** Sass Task */
function sassTask() {
    return src(sassFiles, { sourcemaps: true })
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat("style.css"))
        .pipe(dest("dist/assets/css", { sourcemaps: "." }))
        // .pipe(browserSync.stream());
}

/** JS Task */
function jsTask() {
    // return src(jsFiles).pipe(concat("all.js")).pipe(dest("dist/assets/js"));
}

/** PUG Task */
function pugTask() {
    return src(htmlFiles)
        .pipe(pug({ pretty: true, doctype: "HTML" }))
        .pipe(dest("dist"))
        // .pipe(browserSync.stream());
}

/** Assets Task */
function assetsTask() {
    return src("src/assets/**")
        .pipe(dest("dist/assets"))
        .pipe(browserSync.stream());
}

/** Browsersync Tasks */
function browsersyncServe(cb) {
    browserSync.init({
        server: {
            baseDir: "dist"
        }
    });
    cb();
}

/** Watch Task */
function watchTask() {
    watch([
            "src/assets/scss/**/*.scss", 
            "src/assets/imgs/*.+(png|jpeg|jpg|gif|svg)", 
            "src/assets/imgs/*/*.+(png|jpeg|jpg|gif|svg)", 
            "src/assets/js/**/*.js", 
            "src/assets/fonts/**/*.+(eot|woff|woff2)", 
            "src/views/**/*.pug"
        ], 
        series(sassTask, pugTask, assetsTask));
}

exports.default = series(parallel(pugTask, sassTask, assetsTask));
exports.serve = series(browsersyncServe, watchTask, parallel(pugTask, sassTask, assetsTask));
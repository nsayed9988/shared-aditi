const   { src, dest, lastRun, parallel, watch, series } = require("gulp");
const   concat = require("gulp-concat");
const   sass = require("gulp-sass")(require("sass"));
const   pug = require("gulp-pug");
const   autoprefixer = require("gulp-autoprefixer");
const   browserSync = require("browser-sync").create();
const   cached = require("gulp-cached");
const   remember = require("gulp-remember");

/** Files Path */
const FilesPath = {
    sassFiles: "src/assets/scss/**/*.scss",
    jsFiles: "src/assets/js/*.js",
    htmlFiles: "src/views/pages/*.pug"
};

const { sassFiles, jsFiles, htmlFiles } = FilesPath;

/** Sass Task */
function sassTask() {
    return src(sassFiles, { sourcemaps: true })
        .pipe(sass().on("error", sass.logError))
        .pipe(autoprefixer())
        .pipe(concat("style.css"))
        .pipe(dest("src/assets/css", { sourcemaps: "." }));
}

/** PUG Task for Build */
function pugTaskBuild() {
    return src(htmlFiles)
        .pipe(pug({ pretty: true, doctype: "HTML" }))
        .pipe(dest("dist"));
}

/** PUG Task */
function pugTask() {
    return src("src/views/pages/*.pug") //, { since: lastRun(pugTask) }
        // .pipe(cached("pugTask"))
        .pipe(pug({ pretty: true, doctype: "HTML" }))
        .pipe(remember("pugTask"))
        .pipe(dest("dist"))
        .pipe(browserSync.stream());
}
/** JS Task */
function jsTask() {
    // return src(jsFiles)
    //     .pipe(concat("all.js"))
    //     .pipe(dest("dist/assets/js"));
}
/** Delete Task */
// function cleanTask() {
//     return del(["dist"]);
// }
/** Assets Task */
function assetsTask() {
    return src("src/assets/**")
        .pipe(dest("dist/assets"))
        .pipe(browserSync.stream());
}

function copyCSSTask() {
    return src("src/assets/css/style.css")
        .pipe(dest("dist/assets/css"))
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

/** Watch Assets Task */
function watchAssetsTask() {
    watch([
            "src/assets/imgs/*.+(png|jpeg|jpg|gif|svg)", 
            "src/assets/imgs/*/*.+(png|jpeg|jpg|gif|svg)", 
            "src/assets/js/**/*.js", 
            "src/assets/fonts/**/*.+(eot|woff|woff2)"
        ], 
        series(assetsTask)); 
}

function watchSassTask() {
    watch([
            sassFiles
        ], 
        series(sassTask, copyCSSTask)); 
}

function watchPugTask() {
    watch([
            "src/views/**/*.pug"
        ], 
        series(pugTask)); 
}

exports.default = series(parallel(sassTask, pugTaskBuild, assetsTask));
exports.build = series(parallel(sassTask, pugTaskBuild), assetsTask);
exports.serve = series(browsersyncServe, parallel(watchSassTask, watchPugTask, watchAssetsTask));
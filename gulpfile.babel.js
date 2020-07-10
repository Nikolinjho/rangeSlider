const { src, dest, watch, series, parallel } = require("gulp");                           // gulp


//  html plugins
const rigger = require("gulp-rigger");                          // importer => //= footer.html 
const twig = require('gulp-twig');                              // loops, includes and so more = html {%  %}
const cache = require('gulp-cached');
const ignore = require('gulp-ignore');                          // ignore

//  css plugins
const sass = require("gulp-sass");                             // sass compiler
const sourcemaps = require("gulp-sourcemaps");                 // sourcemap (common)
const cssmin = require("gulp-minify-css");                     // css minifier
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const postcssNested = require('postcss-nested');
const postcssNestedAncestors = require('postcss-nested-ancestors');
const autoprefixer = require('autoprefixer');
const postcssPresetEnv = require('postcss-preset-env');
const postcssImport = require('postcss-import');
const postcssInlineSVG = require('postcss-inline-svg');
const postcssCurrentSelector = require('postcss-current-selector');
const postcssCustomMedia = require('postcss-custom-media');
const postcssExtend = require('postcss-extend-rule');
const postcssMixins = require('postcss-mixins');

// js plugins 
const uglify = require("gulp-uglify");                         // js minifier
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const terser = require('gulp-terser');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
// img plugins
const imagemin = require('gulp-imagemin');
// const jpgRecompress = require('imagemin-jpeg-recompress');
// const tinypng = require('gulp-tinypng');
// server 
const browserSync = require("browser-sync");                      // live server
liveServer = browserSync.create();





const path = {
    html: "./src/**/*.html",         // src/*.html syntax means to take all html files with .html extension from src 
    js: "./src/js/",            // only main files 
    style: "./src/style/",   // for style and js
    img: "./src/img/",               // img/**/*.* syntax means to take all files with any extension from all subfolders of img 
    font: "./src/font/",
    build: {                      // destination folder
        html: "./dist/",
        js: "./dist/js",
        style: "./dist/style",
        img: "./dist/img",
        font: "./dist/font"
    },


};

function server() {
    liveServer.init({
        server: {
            baseDir: "./dist"
        },
        host: 'localhost',
        directory: true,
        notify: false,
        port: 8001,
        ui: {
            port: 3003,
        }
    })
}


function reloadServer(cd) {
    liveServer.reload();
    cd();
}


function htmlTask() {
    return src(path.html)
        .pipe(rigger())
        .pipe(twig())
        .pipe(ignore.exclude(`templates/**/*.html`))
        .pipe(dest(path.build.html));
}
// // getting ready style plugins
function postCSSPlugins() {
    return [
        postcssImport(),
        postcssExtend(),
        postcssMixins(),
        postcssNestedAncestors(),
        postcssNested(),
        postcssCurrentSelector(),
        postcssCustomMedia(),
        autoprefixer(),
        postcssPresetEnv(),
        cssnano({
            preset: 'default',
        }),
    ]
}


function cssTask({ file }) {
    return function cssCompilation() {
        return src(`${path.style}${file}`)
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(postcss(postCSSPlugins()))
            .pipe(sourcemaps.write('./'))
            .pipe(dest(path.build.style))
    }
}

// // getting ready js files
function jsTask({ file }) {
    return function jsCompilation() {
        return browserify({ entries: `${path.js}${file}`, debug: true, })
            .transform('babelify', {
                global: true,
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-proposal-optional-chaining'],
                sourceMaps: true,
            })
            .bundle()
            .pipe(source(file))
            .pipe(buffer())
            .pipe(rigger())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(terser())
            .pipe(uglify())
            .pipe(sourcemaps.write("./"))
            .pipe(dest(path.build.js));
    }
}

function jsLibs({ file, dist }) {
    return function jsLibsCompilation() {
        return src(`${path.js}lib/**/*.js`)
            .pipe(concat(`lib.js`))
            .pipe(terser())
            .pipe(dest(dist));
    }
}


function fontTask() {
    return src(`${path.font}/**`)
        .pipe(dest(path.build.font));
}

function imgTask() {
    return src(`${path.img}/**`)
        .pipe(imagemin())
        // .pipe(tinypng('ZnSSHkl0jF9sdfVlCVYQvvJjrSSl9zR6'))
        .pipe(cache())
        .pipe(dest(path.build.img))
}


let task = {
    html: parallel(
        htmlTask
    ),
    js: parallel(
        jsTask({
            file: "main.js",
        })
    ),
    jsLib: parallel(
        jsLibs({
            dist: "./dist/js/",
        })
    ),
    css: parallel(
        cssTask({
            file: "main.css",
        })
    ),
    font: parallel(
        fontTask
    ),
    img: parallel(
        imgTask
    )
}

// watch
function live() {
    parallel(series(task.html, task.css), task.js, series(task.img, task.font))();
    watch([`${path.html}`], series(task.html, reloadServer));
    watch([`${path.style}**/*.css`,], series(task.css, reloadServer));
    watch([`${path.js}**/*.js`], series(task.js, reloadServer));
    watch([`${path.js}lib/*.js`], series(task.jsLib, reloadServer));
    watch([`${path.font}**`,], series(task.font, reloadServer));
    watch([`${path.img}**/*.{png,jpg,gif,svg,mp4}`], series(task.img, reloadServer))
    server();
}


// default task
exports.default = series(parallel(task.js, task.jsLib, task.html, task.css, task.font, task.img));                       // build
exports.live = live;      // liver


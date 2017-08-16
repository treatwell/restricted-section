// REQUIRES & CONFIG

const gulp = require('gulp')
const util = require('gulp-util')

// General utilities
const del = require('del')
const sourcemaps = require('gulp-sourcemaps')
const concat = require('gulp-concat')
const gulpfilter = require('gulp-filter')

// HTML and Journal
const pug = require('gulp-pug')
const htmlmin = require('gulp-htmlmin')

// CSS
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const csso = require('gulp-csso')

// JavaScript
const browserify = require('gulp-browserify')
const uglify = require('gulp-uglify')

// Development
const watch = require('gulp-watch')
const connect = require('gulp-connect')

const paths = {
  pages: 'source/content/**/*.pug',
  templates: 'source/assets/templates/**/*.pug',

  stylesheets: 'source/assets/stylesheets/site.scss',
  watchStylesheets: 'source/assets/stylesheets/**/*.scss',

  scripts: 'source/assets/scripts/site.js',
  watchScripts: 'source/assets/scripts/**/*.+(js|coffee)',

  images: 'source/assets/images/**/*.+(png|jpg|gif|svg)',
  fonts: 'source/assets/fonts/**/*',
  icons: 'source/assets/icons/**/*',
  other: [ 'source/assets/**/*.*', 
    "!source/assets/+(templates|stylesheets|scripts|images|icons)/**/*.*" ]
}

const config = require('./config.json')
config.production = !!util.env.production



// TASKS

gulp.task('clean', cb => del(['public'], cb))

const taskStylesheets = () => {
  gulp.src(paths.stylesheets)
  .pipe(gulpfilter([ '**', '!**/_*' ]))
  .pipe(config.production ? util.noop() : sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer())
  .pipe(concat('site.css'))
  .pipe(config.production ? csso() : util.noop())
  .pipe(config.production ? util.noop() : sourcemaps.write())  
  .pipe(gulp.dest('public/css'))
  .pipe(config.production ? util.noop() : connect.reload())
}

gulp.task('stylesheets', ['clean'], taskStylesheets)
gulp.task('stylesheets-watch', taskStylesheets)

const taskScripts = () => {
  gulp.src(paths.scripts)
  .pipe(gulpfilter([ '**', '!**/_*' ]))
  .pipe(browserify({
    debug : !config.production
  }))
  .pipe(config.production ? uglify() : util.noop())
  .pipe(concat('site.js'))
  .pipe(gulp.dest('public/js'))
  .pipe(config.production ? util.noop() : connect.reload())
}

gulp.task('scripts', ['clean'], taskScripts)
gulp.task('scripts-watch', taskScripts)



const taskMedia = () => {
  // Images
  gulp.src(paths.images, { base: 'source/assets/images' })
  .pipe(gulpfilter([ '**', '!**/_*' ]))
  .pipe(gulp.dest('public/img'))
  .pipe(config.production ? util.noop() : connect.reload())
  // Fonts
  gulp.src(paths.fonts)
  .pipe(gulp.dest('public/fonts'))
  .pipe(config.production ? util.noop() : connect.reload())
  // Icons
  gulp.src(paths.icons)
  .pipe(gulp.dest('public'))
  .pipe(config.production ? util.noop() : connect.reload())
  // Misc
  gulp.src(paths.other)
  .pipe(gulp.dest('public'))
  .pipe(config.production ? util.noop() : connect.reload())
}

gulp.task('media', ['clean'], taskMedia)
gulp.task('media-watch', taskMedia)



const taskPages = () => {
  gulp.src(paths.pages)
  .pipe(gulpfilter([ '**', '!**/_*' ]))
  .pipe(pug({ locals: {  config: config }}))
  .pipe(config.production ? htmlmin({ comments: true, 
    conditionals: true, 
    cdata: true, 
    quotes: true, 
    collapseWhitespace: true,
    minifyCSS: true
  }): util.noop())
  .pipe(gulp.dest('public'))
  .pipe(config.production ? util.noop() : connect.reload())
}

gulp.task('pages', ['clean'], taskPages)
gulp.task('pages-watch', taskPages)



// DEVELOPMENT TASKS

gulp.task('watch', ['default'], () => {
  gulp.watch([ paths.watchStylesheets ], [ 'stylesheets-watch' ])
  gulp.watch([ paths.watchScripts ], ['scripts-watch'])
  gulp.watch([ paths.images, paths.fonts, paths.icons, paths.other ], ['media-watch'])
  gulp.watch([ paths.pages, paths.templates ], ['pages-watch' ])
})

gulp.task('server', ['default'], () => {
  connect.server({
    root: 'public',
    livereload: true
  })
})

// TASK GROUPS

gulp.task('assets', [ 'stylesheets', 'scripts', 'media' ])
gulp.task('default', [ 'clean', 'assets', 'pages' ])
gulp.task('dev', [ 'default', 'watch', 'server' ])

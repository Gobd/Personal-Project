/* jshint node: true */

const
  gulp     = require('gulp')
, stylus   = require('gulp-stylus')
, concat   = require('gulp-concat')
, uglify   = require('gulp-uglify')
, server   = require('gulp-webserver')
, annotate = require('gulp-ng-annotate')
, mainBowerFiles = require('main-bower-files')
, cleanCSS = require('gulp-clean-css')
, sourcemaps = require('gulp-sourcemaps')
, postcss = require('gulp-postcss')
, autoprefixer = require('autoprefixer')
, mocha = require('gulp-mocha')
, jeet = require('jeet')
, nodemon = require('nodemon')
, rupture = require('rupture')
, processors = [autoprefixer()];

gulp.task('server', function(){
  gulp.src('./dist')
  .pipe(server({
    livereload : true
  , port       : 3000
}));
});

gulp.task('stylus', function(){
  gulp.src('./src/styles/*.styl')
  .pipe(sourcemaps.init())
  .pipe(stylus({use: [jeet(), rupture()]}))
  .pipe(postcss(processors))
  .pipe(cleanCSS())
  .pipe(concat('css.min.css'))
  .pipe(sourcemaps.write('/maps'))
  .pipe(gulp.dest('./dist/css'));
});

gulp.task('bowerCss', function(){
  gulp.src(mainBowerFiles('**/*.css'))
  .pipe(sourcemaps.init())
  .pipe(postcss(processors))
  .pipe(cleanCSS())
  .pipe(concat('lib.min.css'))
  .pipe(sourcemaps.write('/maps'))
  .pipe(gulp.dest('./dist/css'));
});

gulp.task('bowerJs', function(){
  gulp.src(mainBowerFiles('**/*.js'))
  .pipe(sourcemaps.init())
  // .pipe(uglify())
  .pipe(concat('lib.min.js'))
  .pipe(sourcemaps.write('/maps'))
  .pipe(gulp.dest('./dist/js'));
});

gulp.task('js', function(){
  gulp.src('./src/scripts/**/*.js')
  .pipe(sourcemaps.init())
  // .pipe(annotate())
  // .pipe(uglify())
  .pipe(concat('js.min.js'))
  .pipe(sourcemaps.write('/maps'))
  .pipe(gulp.dest('./dist/js'));
});

//disabled because while developing tests it exits gulp every time a test fails
// so once your tests are all working enable this and add the tests function the default task
// gulp.task('tests', function(){
//     return gulp.src('./server/tests/*.js', {read: false})
//         .pipe(mocha());
// });

gulp.task('watch', function(){
  gulp.watch('./src/styles/**/*.styl', ['stylus']);
  gulp.watch('./src/scripts/**/*.js', ['js']);
  gulp.watch('./bower_components/satellizer/satellizer.js', ['bowerJs']);
});

gulp.task('default', ['stylus', 'js', 'bowerJs', 'bowerCss', 'watch', 'server']);
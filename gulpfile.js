// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
var mocha = require('gulp-mocha');
var should = require('chai').should();

// Lint Task
gulp.task('lint', function() {
  return gulp.src('./dev/javascripts/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Testing 
gulp.task('test', function() {
  return gulp.src(['test/server/**/*.js', 'test/client/**/*.js'], { read: false })
  .pipe(mocha({
    reporter: 'spec',
    globals: {
      should: should
    }
  }));
});

// Concat & Minify CSS
gulp.task('minify-css', function() {
  gulp.src(['./dev/stylesheets/bootstrap.min.css','./dev/stylesheets/style.css'])
    .pipe(minifyCSS({keepBreaks:true}))
    .pipe(concat('all.min.css'))
    .pipe(gulp.dest('./dist/css/'))
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  return gulp.src([
    './dev/javascripts/vendor/jquery.min.js',
    './dev/javascripts/vendor/bootstrap.min.js',
    './dev/javascripts/vendor/d3.min.js',
    './dev/javascripts/vendor/moment.min.js',
    './dev/javascripts/*.js'
    ])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(rename('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'));
});

// Default Task
gulp.task('default', ['lint', 'test', 'minify-css', 'scripts']);

// Dev Task
gulp.task('dev', function () {
  nodemon({ script: './bin/www', ext: 'html js', ignore: [] })
    .on('start', ['lint','test'])
    .on('change', ['lint','test'])
    .on('restart', function () {
      console.log('... restarted ...');
    });
});

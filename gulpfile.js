var fs = require('fs');
    gulp           = require('gulp'),
    gutil          = require('gulp-util'),
    del            = require('del'),
    runSequence    = require('run-sequence'),
    changed        = require('gulp-changed'),

    // HTML and CSS preprocessors
    jade           = require('gulp-jade'),
    sass           = require('gulp-ruby-sass'),

    // Image optimization
    imagemin       = require('gulp-imagemin'),

    // Development server
    connect        = require('gulp-connect'),
    livereload     = require('gulp-livereload'),
    watch          = require('gulp-watch');

var src  = './src',
    dest = './dist',
    tmp  = './tmp';

var srcs = {
      pub:       src + '/public/**/*',
      img:       src + '/assets/images/**/*',
      jade:      src + '/templates/**/*',
      jadeViews: src + '/templates/views/**/*.jade',
      sass:      src + '/assets/stylesheets/**/*.scss'
    };

var dests = {
      pub:    dest + '/',
      jade:   dest + '/',
      assets: dest + '/assets/',
      img:    dest + '/assets/images/',
      sass:   dest + '/assets/stylesheets/'
    };

var env,
    developmentServerPort = 4000,
    jadeLocals = {};

// TASKS
gulp.task('default', function(callback) {
  env = jadeLocals.environment = 'development';

  runSequence(
    ['delete:tmp', 'dest:tmp'],
    ['public', 'images', 'templates', 'stylesheets'],
    ['httpd', 'watch'],
    callback
  );
});

gulp.task('build', function(callback) {
  env = jadeLocals.environment = 'production';

  runSequence(
    ['delete:dist'],
    ['public', 'stylesheets'],
    ['images:optimized', 'templates'],
    callback
  );
});

// SUBTASKS
gulp.task('templates', function() {
  return gulp.src(srcs.jadeViews)
    .pipe(jade({
      basedir: srcs.jade.replace('**/*', ''),
      locals:jadeLocals
    }))
    .pipe(gulp.dest(dests.jade));
});

gulp.task('stylesheets', function() {
  return gulp.src(srcs.sass)
    .pipe(sass({
      style: 'compressed',
      compass: true
    }).on('error', gutil.log))
    .pipe(gulp.dest(dests.sass));
});

gulp.task('images', function() {
  return gulp.src(srcs.img)
    .pipe(changed(dests.img))
    .pipe(gulp.dest(dests.img));
});

gulp.task('images:optimized', function() {
  return gulp.src(srcs.img)
    .pipe(imagemin())
    .pipe(gulp.dest(dests.img));
});

gulp.task('public', function() {
  return gulp.src(srcs.pub)
    .pipe(gulp.dest(dests.pub));
});

// DEVELOPMENT SUBTASKS
gulp.task('watch', function() {
  gulp.watch(srcs.pub,  ['public']);
  gulp.watch(srcs.img,  ['images']);
  gulp.watch(srcs.jade, ['templates']);
  gulp.watch(srcs.sass, ['stylesheets']);
});

gulp.task('httpd', ['livereload'], function() {
  connect.server({
    root: dest,
    port: developmentServerPort,
    livereload: true
  });
});

gulp.task('livereload', function() {
  var glob = dest + '/**/*';

  watch(glob)
    .pipe(connect.reload());
});

// HELPER TASKS
var originalDest;

gulp.task('dest:tmp', function(callback) {
  var key;

  for (key in dests) {
    dests[key] = dests[key].replace(dest, tmp);
  }

  originalDest = dest;
  dest = tmp;

  callback();
});

gulp.task('delete:dist', function(callback) {
  del([ dest +'*' ], callback);
});

gulp.task('delete:tmp', function(callback) {
  del([ tmp +'*' ], callback);
});

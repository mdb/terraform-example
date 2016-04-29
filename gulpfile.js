var fs = require('fs');
    gulp           = require('gulp'),
    gutil          = require('gulp-util'),
    del            = require('del'),
    runSequence    = require('run-sequence'),
    changed        = require('gulp-changed'),

    // HTML
    jade           = require('gulp-jade'),

    // Development server
    connect        = require('gulp-connect'),
    livereload     = require('gulp-livereload'),
    watch          = require('gulp-watch');

var src  = './src',
    dest = './dist',
    tmp  = './tmp';

var srcs = {
  jade:      src + '/templates/**/*',
  jadeViews: src + '/templates/views/**/*.jade'
};

var dests = {
  jade:   dest + '/'
};

var env,
    developmentServerPort = 4000,
    jadeLocals = {};

// TASKS
gulp.task('default', function(callback) {
  env = jadeLocals.environment = 'development';

  runSequence(
    ['delete:tmp', 'dest:tmp'],
    ['templates'],
    ['httpd', 'watch'],
    callback
  );
});

gulp.task('build', function(callback) {
  env = jadeLocals.environment = 'production';

  runSequence(
    ['delete:dist'],
    ['templates'],
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

// DEVELOPMENT SUBTASKS
gulp.task('watch', function() {
  gulp.watch(srcs.jade, ['templates']);
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
  for (var key in dests) {
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

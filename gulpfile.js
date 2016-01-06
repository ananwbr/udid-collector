var gulp = require('gulp')
var sass = require('gulp-sass')

gulp.task('styles', function() {
  gulp.src('./views/static/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./views/static/css/'))
})

gulp.task('default', function() {
  gulp.watch('./views/static/sass/**/*.scss', ['styles'])
})

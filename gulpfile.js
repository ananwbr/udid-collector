var gulp = require('gulp')
var sass = require('gulp-sass')

gulp.task('styles', function() {
  gulp.src('./public/static/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/static/css/'))
})

gulp.task('default', function() {
  gulp.watch('./public/static/sass/**/*.scss', ['styles'])
})

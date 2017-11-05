import gulp from "gulp";
import babel from "gulp-babel";
import webpack from "webpack-stream";


/**
 * Configuration
 */
const config = {
  javascript: {
    src: 'src/javascript/**/*.js',
    dest: 'lib'
  }
}

/**
 * Main build function
 */
function build() {
  return gulp.src(config.javascript.src)
    .pipe(babel( { presets: ['env'] }))
    .pipe(gulp.dest(config.javascript.dest));
}


gulp.task('build', build);

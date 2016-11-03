// include gulp & plugins
var gulp = require('gulp');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

// sass
gulp.task('sass', function() {
	return gulp.src('scss/**/*.scss')
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sass.sync({ outputStyle : 'compressed' }).on('error', sass.logError))
		.pipe(sourcemaps.write('../css'))
		.pipe(gulp.dest('css'));
});

// javascript
gulp.task('javascript', function(){
	return gulp.src(['js/includes/cookie.js', 'js/functions/*.js'])
		.pipe(concat('scripts.js'))
		.pipe(sourcemaps.init({loadMaps: true }))
		.pipe(rename('scripts.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('../js' ))
		.pipe(gulp.dest('js'));
});

// watch for changes
gulp.task('watch', function(){
	gulp.watch('scss/**/*.scss', ['sass']);
	gulp.watch('js/functions/**/*.js', ['javascript']);
});

gulp.task('default', ['sass', 'javascript', 'watch']);
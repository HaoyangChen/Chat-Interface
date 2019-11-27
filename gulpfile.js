/*author:pengling*/
'use strict';
var gulp = require('gulp'),
    path = require('path'),
    p = require('./package.json'),
    sass = require('gulp-ruby-sass'),
    gulpCompass = require('gulp-compass'),
    livereload = require('gulp-livereload'),
    minifycss = require('gulp-minify-css'),
    clean = require('gulp-clean'),
    connect = require('gulp-connect'),
    eos = require('end-of-stream'),
    replace = require('gulp-replace'),
    replaceMd5 = require('gulp-replace-md5'),
//renameMd5 = require('gulp-rename-md5'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-cssmin');


gulp.task('default', ['cleanLocal'], function () {
    gulp.start('server');
});

/*
 *  Local本地调试环境
 */
gulp.task('cleanLocal', function () {
    return gulp.src(['local'])
        .pipe(clean());
});

gulp.task('scriptsLocal', function () {
    return gulp.src(['resource/**/*.js'])
        //md5后缀js
        //.pipe(renameMd5())
        //压缩js
        .pipe(uglify())
        .pipe(gulp.dest('local/Resources'))
});

gulp.task('imagesLocal', function () {
    return gulp.src(['resource/**/*.png','resource/**/*.jpg','resource/**/*.gif'])
        .pipe(gulp.dest('local/Resources'))
});

gulp.task('cssLocal', function () {
    return gulp.src(['resource/**/*.css'])
        .pipe(gulp.dest('local/Resources'))
        //.pipe(minifycss())
        //md5后缀css
        //.pipe(renameMd5())
        //压缩css
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('local/Resources'))
});

gulp.task('sassLocal', function () {
    return sass('resource', { noCache: true, style: 'expanded' })
        .on('error', function (err) {
            console.error('Error', err.message);
        })
        .pipe(gulp.dest('local/Resources'))
        //.pipe(renameMd5())
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('local/Resources'))
});

gulp.task('htmlLocal', ['scriptsLocal','imagesLocal','cssLocal','sassLocal'], function () {
    return gulp.src(['src/**/*.html'])
        //.pipe(replaceMd5({base: __dirname + '/local/'}))
        //.pipe(cleanhtml())   //压缩html
        .pipe(gulp.dest('local/Demo'))
});


gulp.task('buildLocal', ['scriptsLocal','imagesLocal','cssLocal','sassLocal','htmlLocal']);

//replace path of static resources
gulp.task('replaceBuild', function() {
    var path = 'http://static-online.zhaogangtest.com/';
    var route = 'project/ued/zhaogangh5';
    gulp.src('local/Build/**')
        .pipe(replace(/href=\"\/Resources/g, 'href="'  + '../Resources'))
        .pipe(replace(/src=\"\/Resources/g, 'src="'  + '../Resources'))
        .pipe(replace(/src=\"\.\.\/Resources/g, 'src="'  + '../Resources'))
        .pipe(replace(/src=\"\.\.\/Resources/g, 'src="'  + '../Resources'))
        .pipe(gulp.dest('local/Build/'));
});

gulp.task('htmlBuild', ['scriptsLocal','imagesLocal','cssLocal','sassLocal'], function () {
    return gulp.src(['src/**/*.html'])
        .pipe(gulp.dest('local/Build/'));
});

//打包压缩给后台开发
gulp.task('build', ['scriptsLocal','imagesLocal','cssLocal','sassLocal','htmlBuild'], function () {
    return gulp.start("replaceBuild");
});

gulp.task('server', ['buildLocal', 'watch'], function () {
    connect.server({
        root: 'local',
        port:8080,
        livereload: true
    });

    require('opn')('http://localhost:8080/Demo/');
});


gulp.task('htmlLocalWatch', function () {
    return gulp.src('src/**/*.html')
        //.pipe(replaceMd5({base: __dirname + '/local/'}))
        //.pipe(cleanhtml())
        .pipe(gulp.dest('local/Demo'))
});

gulp.task('watch', ['buildLocal'], function () {

    gulp.watch('resource/**/*.css').on('change', function (file) {
        var stream = gulp.src(file.path, {base: 'resource'})
            .pipe(replace(/debug: false/g, 'debug:true'))
            // 保留一份原文件
            .pipe(gulp.dest('local/Resources'))
            //md5后缀css
            //.pipe(renameMd5())
            //压缩css
            .pipe(cssmin())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('local/Resources'))
        eos(stream, function () {
            gulp.start('htmlLocalWatch');
        });
    });


    gulp.watch('resource/**/css/*.scss').on('change', function (file) {

        var stream = sass('resource', {
            noCache: true,
            style: 'expanded'
        })
            .on('error', function (err) {
                console.error('Error', err.message);
            })
            // 保留一份原文件

            .pipe(gulp.dest('local/Resources'))
            //.pipe(renameMd5())
            .pipe(cssmin())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('local/Resources'));

        eos(stream, function () {
            gulp.start('htmlLocalWatch');
        });

    });


    gulp.watch('resource/**/js/*.js').on('change', function (file) {

        var stream = gulp.src(file.path, {base: 'resource'})
            // replace移过来的
            .pipe(replace(/debug: false/g, 'debug:true'))
            // 保留一份原文件
            .pipe(gulp.dest('local/Resources'))
            //md5后缀js
            //.pipe(renameMd5())
            //压缩js
            .pipe(uglify())
            .pipe(gulp.dest('local/Resources'))


        eos(stream, function () {
            gulp.start('htmlLocalWatch');
        });
    });

    gulp.watch('src/**/*.html').on('change', function (file) {
        return gulp.src(file.path, {base: 'src'})
            //.pipe(replaceMd5({base: __dirname + '/local/'}))
            .pipe(gulp.dest('local/Demo'));
    });


    gulp.watch(['resource/**/images/*.png','resource/**images/*.jpg','resource/**images/*.gif'], ['imagesLocal']);

    var server = livereload();
    gulp.watch('local').on('change', function(file) {
        server.changed(file.path);
    });
});








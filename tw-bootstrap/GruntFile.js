module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            less: {
                files: ['less/**/*.less'],
                tasks: ['less:development', 'less:production']
            }
        },
        less: {
            development: {
                options: {
                    paths: ["app"]
                },
                files: {
                    "css/tw-theme.css": ["less/**/*.less"]
                }
            },
            production: {
                options: {
                    paths: ["app"],
                    compress: true
                },
                files: {
                    "css/tw-theme.min.css": ["less/**/*.less"]
                }
            }
        }
    });

    // Load plugins.
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['less']);
};

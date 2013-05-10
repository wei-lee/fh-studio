module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      specs: 'spec/javascripts/tests/**/*.spec.js',
      helpers: ['spec/javascripts/helpers/sinon.js', 'spec/javascripts/helpers/jasmine-jquery.js', 'spec/javascripts/helpers/eventhandler.js', 'spec/javascripts/helpers/factory.js']
    },

    jasmine: {
      src: [
      'src/main/webapp/studio/static/js/model/backbone/event.model.js',
      'src/main/webapp/studio/static/js/model/backbone/alert.model.js',
      'src/main/webapp/studio/static/js/model/backbone/alertnotification.model.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cloud.sysevents.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cloud.alerts.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cloud.alertnotifications.view.js'
      ],

      options: {
        specs: '<%= meta.specs %>',
        helpers: '<%= meta.helpers %>',
        vendor: [
        'src/main/webapp/studio/static/common/js/ui/thirdparty/underscore.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/jquery.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/backbone/backbone.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/handlebars/handlebars.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/handlebars/helpers.js'
        ],
        template: require('grunt-template-jasmine-istanbul'),
        templateOptions: {
          coverage: 'coverage.json',
          report: [{
            type: 'cobertura',
            options: {
              dir: 'coverage-cobertura'
            }
          }, {
            type: 'html',
            options: {
              dir: 'coverage'
            }
          }, {
            type: 'text-summary'
          }]
        },
        junit: {
          path: 'test-report',
          consolidate: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task.
  grunt.registerTask('default', ['jasmine']);
};
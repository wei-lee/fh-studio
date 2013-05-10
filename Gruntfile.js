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
      'src/main/webapp/studio/static/js/views/common/datatable.view.js',
      'src/main/webapp/studio/static/js/views/common/swap_select.view.js',
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
        'src/main/webapp/studio/static/common/js/ui/thirdparty/bootstrap/bootstrap.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/plugins/jquery.dataTables.min.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/plugins/jquery.dataTables.fhext.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/select2/select2.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/backbone/backbone.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/highcharts/moment.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/handlebars/handlebars.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/handlebars/helpers.js',
        'src/main/webapp/studio/static/common/js/util/StringUtil.js'
        ],
        /*template: require('grunt-template-jasmine-istanbul'),
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
        },  */
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
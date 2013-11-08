module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      specs: 'spec/javascripts/tests/**/*.spec.js',
      helpers: ['spec/javascripts/fixtures/globals.js', 'spec/javascripts/helpers/sinon.js', 'spec/javascripts/helpers/jasmine-jquery.js', 'spec/javascripts/helpers/eventhandler.js', 'spec/javascripts/helpers/factory.js']
    },

    jasmine: {
      src: [
      'src/main/webapp/studio/static/js/application/Constants.js',
      'src/main/webapp/studio/static/js/model/backbone/event.model.js',
      'src/main/webapp/studio/static/js/model/backbone/alert.model.js',
      'src/main/webapp/studio/static/js/model/backbone/alertnotification.model.js',
      'src/main/webapp/studio/static/js/views/common/datatable.view.js',
        'src/main/webapp/studio/static/js/views/common/fullpage_message.js',
      'src/main/webapp/studio/static/js/views/common/swap_select.view.js',
      'src/main/webapp/studio/static/js/views/plugins/plugins.view.js',
//      'src/main/webapp/studio/static/js/views/plugins/dashboard/plugins.dashboard.view.js',
//      'src/main/webapp/studio/static/js/views/plugins/plugins.controller.js',
//      'src/main/webapp/studio/static/js/model/backbone/plugin.model.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cloud.sysevents.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cloud.alerts.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cloud.alertnotifications.view.js',
      'src/main/webapp/studio/static/js/model/backbone/databrowser.model.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.collectionslist.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.dataview.table.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.dataview.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.advancededitor.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.filters.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.message.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.dataview.pagination.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.migrate.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.controller.js',
      'src/main/webapp/studio/static/js/application/dispatch/dispatch.js',
      'src/main/webapp/studio/static/js/model/backbone/cms.section.model.js',
      'src/main/webapp/studio/static/js/views/forms/forms.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.view.controller.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.tree.view.js',
        'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.audit.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.section.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.listfield.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.listfield.topbar.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.table.view.js',
      'src/main/webapp/studio/static/js/views/view.mixins.js',
        'src/main/webapp/studio/static/js/application/dispatch/dispatch.js'
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
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jsoneditor/jsoneditor.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/async/async.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/backbone-deep-model/deep-model.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/rivets/rivets.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/formbuilder/formbuilder.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/underscore.string.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/underscore.mixin.deepExtend/index.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery-ui/jquery-ui.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery-ui/jquery-ui.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/plugins/jquery.jstree.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/plugins/jquery.cookie.js',
        'src/main/webapp/studio/static/common/js/util/StringUtil.js'
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
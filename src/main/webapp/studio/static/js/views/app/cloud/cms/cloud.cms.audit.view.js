var App = App || {};
App.View = App.View || {};

App.View.CMSAudit = App.View.CMS.extend({
  events: {

  },
  templates : {
    'cms_back' : '#cms_back'
  },
  audit : [],
  initialize: function(options){
    this.compileTemplates();
    App.dispatch.on("cms.audit", $.proxy(this.log, this));
  },
  render : function(){
    var self = this,
    data = [];

    this.$el.empty();

    this.$el.addClass('cmsAudit');

    this.$el.append(this.templates.$cms_back());
    this.$el.append("<h3>CMS Audit Log</h3>");

    _.each(this.audit, function(r){
      r = r.split(':');
      data.push({
        date : r[0],
        msg : r.slice(1, r.length).join('')
      });
    });

    this.table = new App.View.DataTable({
      aaData : data,
      "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
      },
      "aoColumns": [
        {
          "sTitle": 'Date',
          "mDataProp": 'date'
        },
        {
          "sTitle": 'Message',
          "mDataProp": 'msg'
        },
        {
          "sTitle": '',
          "mDataProp": function(){
            return '<a class="btn btn-primary">Revert</a>';
          }
        }
      ],
      "bAutoWidth": false,
      "sPaginationType": 'bootstrap',
      "sDom": "<'row-fluid'<'span4'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>",
      "bLengthChange": false,
      "iDisplayLength": 5,
      "bInfo": true,
      "bFilter": false,
      "oLanguage" : {
        "sEmptyTable" : "No audit logs found"
      }
    });
    this.$el.append(this.table.render().$el);
    return this;
  },
  log : function(auditLog){
    this.audit.push(new Date().toString() + ": " + auditLog);
  }
});
var Admin = Admin || {};
Admin.Auditlogs = Admin.Auditlogs || {};

Admin.Auditlogs.Controller = Controller.extend({
  models: {
    audit_log: new model.AuditLogEntry()
  },

  views: {
    audit_logs_list: "#admin_audit_log_list"
  },

  alert_timeout: 3000,

  container: null,

  audit_log_table: null,

  init: function(params) {
    this.field_config = params  ? params.field_config : null;
  },

  show: function(e) {
    this.hide();

    $(this.views.audit_logs_list).show();
    this.container = this.views.audit_logs_list;
    this.models.audit_log.list(this.renderAuditLogTable, console.error, true);
  },

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
  },

  renderAuditLogTable: function(data) {
    this.audit_log_table = $('#admin_audit_logs_list_table').dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns
    });
  }

});
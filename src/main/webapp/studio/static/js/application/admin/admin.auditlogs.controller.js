var Admin = Admin || {};
Admin.Auditlogs = Admin.Auditlogs || {};

Admin.Auditlogs.Controller = Controller.extend({
  models: {
    audit_log: new model.AuditLogEntry(),
    user : new model.User(),
    store_item: new model.StoreItem()
  },

  views: {
    audit_logs_list: "#admin_audit_log_list"
  },
  
  filterFields :{
    userGuid : "select#auditlogUserGuid",
    storeItemGuid : "select#auditlogStoreItemGuid",
    storeItemType : "select#auditlogStoreItemBinaryType",
    logLimit: "select#auditlogLimit"
  },
  
  template : function (type ,args){
      if(type === "option"){
          return "<option value="+args.val+">"+args.text+"</option>";
      }
  },  

  alert_timeout: 3000,

  container: null,

  audit_log_table: null,

  init: function(params) {
    this.field_config = params  ? params.field_config : null;
  },

  show: function(e) {
    var self = this;  
    this.hide();
    var limits = [10,100,1000];
    $(this.views.audit_logs_list).show();
    this.container = this.views.audit_logs_list;
    
    //render the audilogs
    this.models.audit_log.list(function(data){
        self.renderAuditLogTable(data);
    }, console.error, true);
    
    //render limit filter option
    var limitSelect = $(self.filterFields.logLimit);
    for(var l=0; l< limits.length; l++){
        limitSelect.append(self.template("option",{val:limits[l],text:limits[l]}));
    }
    //render users limit option //TODO seems like with a single page app a lot of caching could be done and events fired when something is
    //done that would require data to update.
    this.models.user.list(function(res) {
       //remove elements before creating the select options 
       $(self.filterFields.userGuid +' option:not(:first)').remove();
       $(res.list).each(function(idex,item){
          if(item.fields.username && item.guid){
              $(self.filterFields.userGuid).append(self.template("option",{val:item.fields.username, text:item.fields.username}));
          } 
       });
    });
    //render storeitem filter options
   this.models.store_item.list(function (res){
       $(self.filterFields.storeItemGuid +' option:not(:first)').remove();
       $(res.list).each(function(idex,item){
           
          if(item.name && item.guid){
              $(self.filterFields.storeItemGuid).append(self.template("option",{val:item.guid,text:item.name}));
          } 
       });
   });
   //bind filter button
   $('button#audit_log_order').unbind().bind("click",$.proxy(self.doFilter, this));
  },
  
  doFilter : function (){
     //build params ob and send to listlogs to filter
     var self = this;
     var userGuid = $(self.filterFields.userGuid).val();
     var storeItemGuid = $(self.filterFields.storeItemGuid).val();
     var storeItemType = $(self.filterFields.storeItemType).val();
     var limit = $(self.filterFields.logLimit).val();
     var params = {
     };
     if(userGuid && userGuid !=="all") params.userId = userGuid;
     if(storeItemGuid && storeItemGuid !=="all")params.storeItemGuid = storeItemGuid;
     if(storeItemType && storeItemType !== "all")params.storeItemBinaryType = storeItemType;
     if(limit && limit !== "all") params.limit = limit;
     
     this.models.audit_log.listLogs(this.renderAuditLogTable, console.error, true,params);
     
     return false;
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
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
    logLimit: "select#auditlogLimit",
    storeItemBinaryType:"select#auditlogStoreItemBinaryType"
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
   
    $(this.views.audit_logs_list).show();
    this.container = this.views.audit_logs_list;
    self.renderAuditLogFilterForm();
    
    this.models.audit_log.list($.proxy(self.renderAuditLogTable, self), console.error, true);
  },
  
  renderAuditLogFilterForm : function () {
    var self = this;
    var limits = [10,100,1000];
    $('.selectfixedWidth').css("width","200px");
    $(this.filterFields.logLimit + ' option:not(:first)').remove();
    for(var l=0; l< limits.length; l++){
       $(self.filterFields.logLimit).append(self.template("option",{val:limits[l],text:limits[l]}));
    }
    //render the binary types filter
    $(this.filterFields.storeItemBinaryType + ' option:not(:first)').remove();
    this.models.store_item.listValidItemTypes(function(res){
      if(res && res.list){
          $(res.list).each(function(index, item){
              $(self.filterFields.storeItemBinaryType).append(self.template("option",{val:item, text:item}));
          });
      }  
    },console.error);
    //render users limit option //TODO seems like with a single page app a lot of caching could be done and events fired when something is
    //done that would require data to update.
    this.models.user.list(function(res) {
       //remove elements before creating the select options 
       $(self.filterFields.userGuid +' option:not(:first)').remove();
       $(res.list).each(function(idex,item){
          if(item.fields.username && item.guid){
              $(self.filterFields.userGuid).append(self.template("option",{val:item.guid, text:item.fields.username}));
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
   var filterButton = $('button#audit_log_order');
   filterButton.text($fw.client.lang.getLangString("audit_log_order"));
   filterButton.unbind().bind("click",$.proxy(self.doFilter, this));
   var resetButton = $('button#audit_log_reset');
   resetButton.text($fw.client.lang.getLangString("audit_log_reset"));
   resetButton.unbind().bind("click",function (e){
     e.preventDefault();
     $.each(self.filterFields, function(name, target){
       $(target).val($(target + " option:first").val());
     });
     self.models.audit_log.list($.proxy(self.renderAuditLogTable,self), console.error, true);
   });
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
     
     this.models.audit_log.listLogs($.proxy(this.renderAuditLogTable,this), console.error, true,params);
     
     return false;
  },

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
  },

  renderAuditLogTable: function(data) {
    var self = this;
    var titleCol = self.getColumnIndexForField(data.aoColumns, 'sTitle', "Title");
    var userCol = self.getColumnIndexForField(data.aoColumns, 'sTitle', "User");
    var guidCol  = self.getColumnIndexForField(data.aoColumns, 'sTitle', "StoreItem ID");

    var tbl = $('#admin_audit_logs_list_table');

    this.audit_log_table = tbl.dataTable({
      "aaSorting":[[6,'desc']],
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns,
      // process each page as needed
      "fnDrawCallback": function() {
        // be carefull of the col indexes it will depend on what cols are visible
        var cells = $("td::nth-child(" + titleCol + ")", tbl);
        $(cells).attr("data-controller","admin.storeitems.controller");
        $(cells).attr("data-field","title");

        cells = $("td::nth-child(" + userCol + "):not(:empty)", tbl);
        $(cells).attr("data-controller","admin.users.controller");

        $("td[data-controller]").css({cursor:"pointer"});

        // apply the guid as title
        $("tr", tbl).each(function (i,row) {
          var data = self.auditLogDataForRow(tbl.dataTable(),$(row).get(0));
          if(data) {
            $(row).attr("title",data[guidCol]);
          }
        });

      }
    });

    self.bindRowClicks(tbl);
  },
  auditLogDataForRow: function(datatable, el) {
    return datatable.fnGetData(el);
  },


  bindRowClicks: function(tbl) {
    var self = this;
    $('tr td[data-controller]', tbl).die().live("click", function() {
      var guid;
      var field = $(this).attr("data-field");
      if(field) {
        guid = $(this).parent("[" + field +"]").attr(field);
      } else {
        guid = $(this).text().trim();
      }

      if(guid && guid.length !== 0) {
        self.hide();
        var controller = $(this).attr('data-controller');

        var navlist = $(".admin_nav_list");
        $(".active", navlist).removeClass("active");
        $("li > [data-controller='" + controller + "']", navlist).parent().addClass("active");

        $fw.client.tab.admin.getController(controller).show($(this),guid);
      }
      return false;
    });
  }

});
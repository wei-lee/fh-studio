var Admin = Admin || {};

Admin.Storeitems = Admin.Storeitems || {};

Admin.Storeitems.Controller = Controller.extend({
  models: {
    store_item: new model.StoreItem(),
    group: new model.Group(),
    auth_policy: new model.ArmAuthPolicy(),
    audit_log : new model.AuditLogEntry(),
    user : new model.User()
  },

  views: {
    store_items: "#admin_store_items",
    store_item: "#admin_store_item",
    store_item_create: "#admin_store_item_create",
    store_item_update: "#admin_store_item_update",
    store_item_audit_table: '#admin_audit_logs_item_list_table'
  },

  filterFields :{
    userGuid : "select#binAuditlogUserGuid",
    storeItemType : "select#binAuditlogStoreItemBinaryType",
    logLimit: "select#binAuditlogLimit",
    storeItemBinaryType:"select#binAuditlogStoreItemBinaryType"
  },

  audit_log_tabe:null,

  alert_timeout: 3000,
  conatiner: null,
  FORMAT:"DD/MM/YYYY HH:mm",

  template : function (type ,args){
    if(type === "option"){
      return "<option value="+args.val+">"+args.text+"</option>";
    }
  },
  init: function() {},

  show: function() {
    this.hideAlerts();
    this.showStoreItems();
  },

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
    this.reset();
  },

  reset: function() {
    $.each(this.views, function(k, v) {
      $('input[type=text],input[type=email],input[type=password], input[type=file], textarea', v).val('');
      $('input[type=checkbox]', v).removeAttr('checked');
    });
  },

  setStoreIcon: function(data) {
    var icon = $('.store_item_icon', this.views.store_item_update);
    if (data !== '') {
      icon.attr('src', 'data:image/png;base64,' + data);
    } else {
      icon.attr('src', '/studio/static/themes/default/img/store_no_icon.png');
    }
  },

  setStoreName: function(data) {
    var name = $(".store_item_title .store_item_name", this.views.store_item_update);
    name.text(': \'' + data + '\'');
  },

  showStoreItems: function() {
    var self = this;
    this.hide();
    $(this.views.store_items).show();
    this.models.store_item.list(function(res) {
      self.renderItems(res.list);
    }, function(err) {
      console.error(err);
    }, true);
  },

  showStoreItemBinaries: function() {
    this.showStoreItemTab("#binaries");
  },

  showStoreItemDetails: function() {
    this.showStoreItemTab("#details");
  },

  showStoreItemAuditLogs: function() {
    this.showStoreItemTab("#auditlogs");
  },

  showStoreItemTab: function(href) {
    this.getStoreItemTab(href).tab('show') ;
  },

  getStoreItemTab: function() {
    var href = arguments[0];
    if(href){
      href = '[href="' + href + '"]';
    } else {
      href = "";
    }
    return $('a[data-toggle="tab"]' + href , this.views.store_item_update);
  },

  renderItems: function(store_items) {
    var self = this;
    var list = $(this.views.store_items);
    list.find('li').remove();

    $.each(store_items, function(i, store_item) {
      var list_item = $(self.views.store_item).clone().show().removeAttr('id').removeClass('hidden_template');
      list_item.data('store_item', store_item);
      list_item.find('.details h3').html($("<span/>",{"text":store_item.name, "class":"name"}));
      var content = $("<p/>",{"text":store_item.guid});
      content.end();


      list_item.find('.details h3 .name').attr('rel','popover');
      list_item.find('.details h3 .name').attr('data-content',content.html());
      list_item.find('.details h3 .name').attr("data-original-title",store_item.name);

      list_item.find('.details p').text(store_item.description);
      if (store_item.icon !== '') {
        list_item.find('img').attr('src', 'data:image/png;base64,' + store_item.icon);
      } else {
        list_item.find('img').attr('src', '/studio/static/themes/default/img/store_no_icon.png');
      }
      list_item.find('.delete_store_item').unbind().click(function() {
        var guid = store_item.guid;
        self.showBooleanModal('Are you sure you want to delete this Store Item?', function() {
          self.deleteStoreItem(guid);
        });
      });

      list_item.find('.edit_store_item').unbind().click(function() {
        self.showUpdateStoreItem(store_item);
      });

      list_item.appendTo(list);
    });
    $("[rel=popover]").popover({ trigger: "hover" });

    this.bind();
  },

  deleteStoreItem: function(guid) {
    var self = this;
    self.container = self.views.store_items;
    this.models.store_item.remove(guid, function() {
      self.showAlert('success', "Store Item successfully deleted");
      self.showStoreItems();
    }, function(err) {
      self.showAlert('error', err);
      self.showStoreItems();
      console.log(err);
    });
  },

  showCreateStoreItem: function() {
    var self = this;
    this.hide();
    this.models.auth_policy.list(function(res) {
      $(self.views.store_item_create).show();
      self.bind();
      self.renderAvailableAuthPolicies(res.list, [], '.store_item_auth_policies_swap');

      self.models.group.list(function(res) {
        self.renderAvailableGroups(res.list, [], '.store_item_groups_swap');
      }, function(err) {
        console.log(err);
      });

    }, function(err) {
      console.log(err);
    }, false);
  },

  showUpdateStoreItem: function(store_item) {
    var self = this;
    var container = $(self.views.store_item_update);
    self.container = container;

    this.hide();

    self.setStoreIcon(store_item.icon);
    self.setStoreName(store_item.name);
    self.clearAuditLogTable();

    // Disable bundle id inputs
    $('.bundle_id, .update_bundle_id', self.views.store_item_update).attr('disabled', 'disabled');

    this.models.auth_policy.list(function(res) {
      //var update_view = $(self.views.store_item_update);

      //self.showStoreItemDetails();
      // Remove uploaded status labels
      $('span.label', container).remove();
      $('.bundle_id', container).val('');

      var assigned_auth_policies = store_item.authpolicies;
      self.renderAvailableAuthPolicies(res.list, assigned_auth_policies, '.store_item_auth_policies_swap');

      $('.item_guid', container).val(store_item.guid);
      $('.item_name', container).val(store_item.name);
      $('.item_id', container).val(store_item.authToken);
      $('.item_description', container).val(store_item.description);

      if (store_item.restrictToGroups) {
        $('.restrict_to_groups', container).attr('checked', 'true');
      } else {
        $('.restrict_to_groups', container).removeAttr('checked');
      }

      self.showStoreItemDetails();
      container.show();

      $('.update_store_item', container).unbind().click(function(e) {
        e.preventDefault();
        var n = $(this).attr("data-next");
        $(this).removeAttr("data-next");

        self.updateStoreItem(store_item,n);
        return false;
      });

      var input = $("#icon_binary");
      self.renderIconUpload(store_item, input);

    }, function(err) {
      console.log(err);
    }, false);

    this.models.group.list(function(res) {
      var assigned_groups = store_item.groups;
      self.renderAvailableGroups(res.list, assigned_groups, '.store_item_groups_swap');
    }, function(err) {
      console.log(err);
    });

    // unbind old event on all tabs
    self.getStoreItemTab().unbind();

    // bind to bootstrap shown event to load table
    self.getStoreItemTab("#binaries").on('shown', function () {
      self.renderBinaryUploads(store_item);
    });


    // bind to bootstrap shown event to load table
    self.getStoreItemTab("#auditlogs").on('shown', function () {
      self.renderAuditLogFilterForm(store_item);
      var cb = function(data){self.renderAuditLogTable(data,store_item);};
      self.models.audit_log.listLogs( cb, console.error, true,{"storeItemGuid":store_item.guid});
    });
  },

  renderIconUpload: function (store_item,input){
    var self = this;
    var row = input.parents('.controls');
    var status_el = $('.upload_status', row);

    // Inject binary upload progress template
    var progress_area = $('.progress_area', row);
    var progress_bar = $('.progress', progress_area);

    // Setup file upload
    input.fileupload('destroy').fileupload({
      url: Constants.ADMIN_STORE_ITEM_UPLOAD_BINARY_URL,
      dataType: 'json',
      replaceFileInput: false,
      formData: [{
        name: 'guid',
        value: store_item.guid
      }, {
        name: 'type',
        value: 'icon'
      }],
      dropZone: input,
      timeout: 120000,
      add: function(e, data) {
        input.hide();
        progress_bar.slideDown();
        data.submit();
      },
      done: function(e, data) {
        var message;
        var err = (data.result.status !== 'ok');
        if (!err) {
          // update the store item with new data
          $.each(data.result, function(k,v){store_item[k] = v;});
          self.setStoreIcon(store_item.icon);
          message = 'Uploaded ' + data.files[0].name;
        } else {
          message = 'Error: ' + data.result.message;
        }
        progress_bar.hide();
        input.show();
        self.showAlert(err ? 'error' : 'success', message);
      },
      progressall: function(e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('.bar', progress_bar).css('width', progress + '%');
      }
    });
  },

  renderAuditLogFilterForm : function (store_item) {
    var self = this;
    var limits = [10,100,1000];
    $('.selectfixedWidth').css("width","200px");
    $(this.filterFields.logLimit + ' option:not(:first)', $(self.views.store_item_audit_table)).remove();
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
    self.bindFilter(store_item);

  },
  bindFilter : function (store_item){
    var self= this;
    //bind filter button
    var filterButton = $('button#binAudit_log_order');
    filterButton.text($fw.client.lang.getLangString("audit_log_order"));
    //filterButton.unbind().bind("click",$.proxy(self.doFilter, this));
    filterButton.unbind().bind("click",function(e){
      e.preventDefault();
      self.clearAuditLogTable();
      self.doFilter(store_item);
    });
    var resetButton = $('button#binAudit_log_reset');
    resetButton.text($fw.client.lang.getLangString("audit_log_reset"));
    resetButton.unbind().bind("click",function (e){
      e.preventDefault();
      self.resetFilter(store_item);
      self.clearAuditLogTable();
      var params = {"storeItemGuid":store_item.guid};
      self.models.audit_log.listLogs(function(data){
        return self.renderAuditLogTable(data,store_item);
      }, console.error, true,params);
    });
  },
  resetFilter : function (store_item){
    this.bindFilter(store_item);
    $.each(this.filterFields, function(name, target){
      $(target).val($(target + " option:first").val());
    });
    this.showAlert('success', "Store Item Audit Log filter reset");
  },
  doFilter : function (store_item){
    //build params ob and send to listlogs to filter
    var self = this;
    var userGuid = $(self.filterFields.userGuid).val();
    var storeItemType = $(self.filterFields.storeItemType).val();
    var limit = $(self.filterFields.logLimit).val();
    var params = {"storeItemGuid":store_item.guid};
    if(userGuid && userGuid !=="all") params.userId = userGuid;
    if(storeItemType && storeItemType !== "all")params.storeItemBinaryType = storeItemType;
    if(limit && limit !== "all") params.limit = limit;

    this.models.audit_log.listLogs(function(data){
      self.showAlert('success', "Store Item Audit filter complete");
      return self.renderAuditLogTable(data,store_item);
    }, console.error, true,params);

    return false;
  },

  renderAuditLogTable : function (data,store_item){
    var tbl = $(this.views.store_item_audit_table);
    this.audit_log_table = tbl.dataTable({
      "aaSorting":[[6,'desc']],
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns
    });

    this.audit_log_table.fnSetColumnVis( 1, false );
    tbl.show();
    //this.renderAuditLogFilterForm(store_item);
  },

  clearAuditLogTable : function (){
    if(this.audit_log_table ){
      this.audit_log_table.fnClearTable();
    }
  },

  renderBinaryUploads: function(store_item) {
    var self = this;
    $('.tab-pane #binaries').hide();

    // Config
    var binaries = [
    {
      id: 'android_binary',
      destination: 'android',
      params: [{
        name: 'guid',
        value: store_item.guid
      }, {
        name: 'type',
        value: 'android'
      }]
    }, {
      id: 'iphone_binary',
      destination: 'iphone',
      params: [{
        name: 'guid',
        value: store_item.guid
      }, {
        name: 'type',
        value: 'iphone'
      }]
    }, {
      id: 'ipad_binary',
      destination: 'ipad',
      params: [{
        name: 'guid',
        value: store_item.guid
      }, {
        name: 'type',
        value: 'ipad'
      }]
    }, {
      id: 'ios_binary',
      destination: 'ios',
      params: [{
        name: 'guid',
        value: store_item.guid
      }, {
        name: 'type',
        value: 'ios'
      }]
    }];

    self.setStoreIcon(store_item.icon);
    self.setStoreName(store_item.name);
    $('.bundle_id, .update_bundle_id', self.views.store_item_update).attr('disabled', 'disabled');


    $.each(binaries, function(i, binary ) {
      var sib= $.grep(store_item.binaries, function(sib) {
        return binary.destination === sib.type;
      });
      self.renderBinaryRow(store_item,binary, sib[0]);
    });
    $("a[rel=popover]").popover({ trigger: "hover" });
  },

  renderBinaryRowHistory: function (store_item, binary, sib, row) {
    var self = this;
    $('.controls .accordion', row).remove();

    var id = binary.destination + "_target";
    var template = $("#binary_history_template").clone().removeAttr('id').removeClass('hidden_template');

    var target =  $("div#template_collapse", template).attr("id", id);
    $("div a.accordion-toggle", template).attr("href" , "#" + id);


    if(sib) {
      var name = "'" + store_item.name + "'";
      var c = self.binaryRowHistoryItem(store_item,sib,["Download", name ].join(" "),true);
      $(".history",template).append(c);
      $.each(sib.versions, function (i,sibh){
        var c = self.binaryRowHistoryItem(store_item,sibh,["Download", name].join(" "));
        $(".history",template).append(c);
      });
    }
    $('.controls .progress_area', row).after(template);
    $('.controls .accordion .accordion-heading a', row).text("[+] History");
    $('.controls .accordion', row).on('hidden', function () {
      $('.accordion-heading a', this).text("[+] History");
    });

    $('.controls .accordion', row).on('shown', function () {
      $('.accordion-heading a', this).text("[-] History");
    });

    return template;
  },

  renderBinaryRow: function (store_item,binary,sib){
    var self = this;
    var input = $('#' + binary.id);
    var row = input.parents('tr');

    var history = self.renderBinaryRowHistory(store_item, binary , sib, row);
    //$('.controls .progress_area', row).after(history);

    var progress_area = $('.progress', row);
    var progress_bar = $('.bar', progress_area);

    // Render Binary config
    if ($(row).has('.bundle_id').length > 0) {
      var bundle_config_input = $('.bundle_id', row);
      var config = self._configForDestination(store_item, binary.destination);
      if (config) {
        bundle_config_input.val(config.bundle_id);
      }
    }

    // Does a binary already exist?
    var binary_upload_status = self._resolveUploadStatus(binary.destination, store_item);
    if (binary_upload_status === true) {
      $('.bundle_id, .update_bundle_id', row).removeAttr('disabled');
    }

    // Setup file upload
    input.fileupload('destroy').fileupload({
        url: Constants.ADMIN_STORE_ITEM_UPLOAD_BINARY_URL,
        dataType: 'json',
        replaceFileInput: false,
        formData: binary.params,
        dropZone: input,
        timeout: 120000,
        add: function(e, data) {
          input.hide();
          progress_area.show();
          progress_bar.slideDown();
          data.submit();
        },
        done: function(e, data) {
          input.show();
          progress_area.hide();
          progress_bar.slideUp();
          var message;
          var err = (data.result.status !== 'ok');
          if (!err) {
            // update the store item with new data
            $.each(data.result, function(k,v){store_item[k] = v;});
            self.renderBinaryUploads(store_item,true);
            message = 'Uploaded ' + data.files[0].name;
          } else {
            message = 'Error: ' + data.result.message;
          }
          self.showAlert(err ? 'error' : 'success', message);
        },
        progressall: function(e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          $(progress_bar).css('width', progress + '%');
        }
    });
  },

  binaryRowHistoryItem: function(store_item,sib,title,current) {
    var date = moment(sib.sysModified ? sib.sysModified : sib.storeItemBinaryModified);

    var version = sib.storeItemBinaryVersion ;
    var link = $('<a/>', {href :sib.url, text:(date.format(this.FORMAT)),title:"click to download version " + version});
    if(sib.type !== "android") {
      $(link).attr('target', "_blank");
      if(current === true){
        var href = $(link).attr("href");
        $(link).attr('href', href + "&download=true");
      }

    }

    var row = $('<p/>')
                .append($('<span/>', {text:(version + " : ")}))
                .append(link);
    row.end();
    return row;
  },
  _resolveUploadStatus: function(destination, store_item) {
    var uploaded = null;
    if (destination) {
      // App Binary check
      var binaries = store_item.binaries;

      // No uploaded binaries
      if (binaries.length === 0) {
        return false;
      }

      $.each(binaries, function(i, binary) {
        if (binary.type == destination) {
          uploaded = true;
        }
      });
    } else {
      // Icon check
      if (store_item.icon !== '') {
        return true;
      } else {
        return false;
      }
    }
    return uploaded;
  },

  _configForDestination: function(store_item, destination) {
    var config = null;
    $.each(store_item.binaries, function(i, binary) {
      if (binary.type === destination) {
        config = binary.config;
      }
    });
    return config;
  },

  updateStoreItem: function(store_item, n) {
    var self = this;
    var container = $(this.views.store_item_update);
    self.container = container;
    var name = $('.item_name', container).val();
    var item_id = $('.item_id', container).val();
    var description = $('.item_description', container).val();
    var auth_policies = this._selectedAuthPolicies(container);
    var groups = this._selectedGroups(container);
    var guid = $('.item_guid', container).val();
    var restrictToGroups = $('.restrict_to_groups', container).is(':checked');

    this.models.store_item.update(guid, name, item_id, description, auth_policies, groups, restrictToGroups, function() {
      self.showAlert('success', "Store Item successfully updated");
      store_item.name = name;
      store_item.description = description;
      store_item.auth_policies = auth_policies;
      store_item.groups = groups;
      self.setStoreName(store_item.name);

      if(n === "binaries") {
        self.showStoreItemBinaries();
      } else {
        self.showStoreItemDetails();
      }
    }, function(err) {
      self.showAlert('error', "Store Item config couldn't be updated");
      console.log(err);
    });
  },

  renderAvailableAuthPolicies: function(available, assigned, container) {
    var available_select = $('.store_item_available_auth_policies', container).empty();
    var assigned_select = $('.store_item_assigned_auth_policies', container).empty();

    var map = {};

    // Massaging into {v: name, v: name} hash for lookup
    $.each(available, function(i, item) {
      map[item.guid] = item.policyId;
    });

    // Assigned first
    $.each(assigned, function(i, guid) {
      var name = map[guid];
      // Check if policy exists still
      if (name) {
        var option = $('<option>').val(guid).text(name);
        assigned_select.append(option);
      }
    });

    // Available, minus assigned
    $.each(map, function(guid, name) {
      if (assigned.indexOf(guid) == -1) {
        var option = $('<option>').val(guid).text(name);
        available_select.append(option);
      }
    });
  },

  renderAvailableGroups: function(available, assigned, container) {
    var available_select = $('.store_item_available_groups', container).empty();
    var assigned_select = $('.store_item_assigned_groups', container).empty();

    var map = {};

    // Massaging into {v: name, v: name} hash for lookup
    $.each(available, function(i, item) {
      map[item.guid] = item.name;
    });

    // Assigned first
    $.each(assigned, function(i, guid) {
      var name = map[guid];
      // Check if policy exists still
      if (name) {
        var option = $('<option>').val(guid).text(name);
        assigned_select.append(option);
      }
    });

    // Available, minus assigned
    $.each(map, function(guid, name) {
      if (assigned.indexOf(guid) == -1) {
        var option = $('<option>').val(guid).text(name);
        available_select.append(option);
      }
    });
  },

  bind: function() {
    var self = this;
    var show_create_button = $('.admin_store_items_controls button', self.views.store_items);
    show_create_button.unbind().click(function() {
      self.showCreateStoreItem();
      return false;
    });

    var create_button = $('.create_store_item', self.views.store_item_create);
    create_button.unbind().click(function() {
      self.createStoreItem();
      return false;
    });

    var update_config = $('.update_bundle_id', self.views.store_item_update);
    update_config.unbind().click(function() {
      var input = $(this).parents('tr').find('.bundle_id');
      var destination = input.attr('data-destination');
      var bundle_id = input.val();
      var guid = $('.item_guid', self.views.store_item_update).val();
      self.updateStoreItemConfig(guid, destination, bundle_id);
      return false;
    });

    this.bindSwapSelect(this.views.store_item_create);
    this.bindSwapSelect(this.views.store_item_update);
  },

  updateStoreItemConfig: function(guid, destination, bundle_id) {
    var self = this;
    self.container = self.views.store_item_update;
    this.models.store_item.updateConfig(guid, destination, bundle_id, function() {
      self.showAlert('success', "Store Item config updated");
    }, function() {
      self.showAlert('error', "Store Item config couldn't be updated");
    });
  },

  createStoreItem: function() {
    var self = this;
    var container = $(this.views.store_item_create);
    self.container = container;
    var name = $('.item_name', container).val();
    var item_id = $('.item_id', container).val();
    var description = $('.item_description', container).val();
    var auth_policies = this._selectedAuthPolicies(container);
    var groups = this._selectedGroups(container);
    var restrictToGroups = $('.restrict_to_groups', container).is(':checked');

    this.models.store_item.create(name, item_id, description, auth_policies, groups, restrictToGroups, function(res) {
      $('.update_store_item', self.update_view).attr("data-next", "binaries");
      setTimeout(function() {self.showAlert('success', "Store Item successfully created");}, 100);
      self.showUpdateStoreItem(res);
    }, function(err) {
      self.showAlert('error', err);
    });
  },

  _selectedAuthPolicies: function(container) {
    var policy_options = $('.store_item_assigned_auth_policies option', container);
    var policies = [];
    policy_options.each(function(i, item) {
      policies.push($(item).val());
    });
    return policies;
  },

  _selectedGroups: function(container) {
    var options = $('.store_item_assigned_groups option', container);
    var selected = [];
    options.each(function(i, item) {
      selected.push($(item).val());
    });
    return selected;
  }
});
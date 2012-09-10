var Admin = Admin || {};

Admin.Deploytarget = Admin.Deploytarget || {};

Admin.Deploytarget.Controller = Controller.extend({
  model : {
    deployTarget: new model.Deploy()
  },

  STATIC_IMAGE_PREFIX : "/studio/static/themes/default/img/",

  valid_targets : [
    {"id":"cloudfoundry", "name":"CloudFoundry", "icon":"cloud_target_cloudfoundry.png", "configurations":{"url": true, "username":true, "password":true, "infrastructure":false}},
    {"id":"stackato", "name":"Stackato", "icon":"cloud_target_stackato.png", "configurations":{"url": true, "username":true, "password":true, "infrastructure":false}},
    {"id":"appfog","name":"AppFog", "icon":"cloud_target_appfog.png", "configurations":{"url": true, "username":true, "password":true, "infrastructure":true}},
    {"id":"ironfoundry","name":"IronFoundry", "icon":"cloud_target_ironfoundry.png", "configurations":{"url": true, "username":true, "password":true, "infrastructure":false}}
  ],

  appfog_valid_infrastructures: [{
    label:'AWS US East - Virginia',
    name: 'aws',
    value: 'aws.af.cm'
  }, {
    label:'AWS EU West - Ireland',
    name: 'eu-aws',
    value:'eu01.aws.af.cm'
  }, {
    label: 'AWS Asia SE - Singapore',
    name: 'ap-aws',
    value: 'ap01.aws.af.cm'
  }, {
    label : 'Rackspace AZ 1 - Dallas',
    name: 'rs',
    value: 'rs.af.cm'
  }, {
    label : 'HP AZ 1 - Las Vegas',
    name: 'hp',
    value: 'hp.af.cm'
  }], 

  views: {
    target_list: "#admin_deploytarget_list",
    target_edit: "#admin_deploytarget_edit"
  },

  container: null,
  target_list_table : null,
  alert_timeout: 10000,

  init: function(){

  },

  show: function(){
    this.hideAlerts();
    this.showTargetList();
  },

  showTargetList: function(){
    var self = this;
    self.hide();
    $(self.views.target_list).show();
    self.container = self.views.target_list;
    self.model.deployTarget.listEditable(function(res){
      var data = self.addControls(res);
      self.renderTargetsTable(data);
      self.bindControls();
    }, function(err){
      console.log("Error showing deployment targets, err: " + err);
    }, true);
  },

  addControls: function(res){
    // Add control column
    res.aoColumns.push({
      sTitle: "Controls",
      "bSortable": false,
      "sClass": "controls"
    });

    $.each(res.aaData, function(i, row) {
      var controls = [];
      // TODO: Move to clonable hidden_template
      controls.push('<button class="btn edit_deploy_target">Edit</button>&nbsp;');
      controls.push('<button class="btn btn-danger delete_deploy_target">Delete</button>&nbsp;');
      row.push(controls.join(""));
    });
    return res;
  },

  renderTargetsTable: function(data) {
    var self = this;

    this.target_list_table = $('#admin_deploytargets_table').dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns
    });

    var create_button = $('<button>').addClass('btn btn-primary pull-right').text('Create').click(function() {
      self.showCreateTarget();
      return false;
    });
    $(this.views.target_list + ' .span12:first').append(create_button);
  },

  bindControls: function() {
    var self = this;
    $('tr td .edit_deploy_target, tr td:not(.controls,.dataTables_empty)', this.views.target_list).unbind().click(function() {
      var row = $(this).parent().parent();
      var data = self.dataForRow($(this).closest('tr').get(0));
      self.showEditTarget(this, row, data);
      return false;
    });
    $('tr td .delete_deploy_target', this.views.target_list).unbind().click(function() {
      var row = $(this).parent().parent();
      var data = self.dataForRow($(this).closest('tr').get(0));
      self.deleteTarget(this, row, data);
      return false;
    });
  },

  dataForRow: function(el) {
    return this.target_list_table.fnGetData(el);
  },

  showEditTarget: function(btn, row, data){
    var targetId = data[0];
    var self = this;
    this.model.deployTarget.read(targetId, function(res){
      self.showTargetEditArea(res.fields);
    }, function(err){
      console.log("Failed to load deploy target : " + targetId);
    }, false);
  },

  deleteTarget: function(btn, row, data){
    var self = this;
    self.showBooleanModal("Are you sure you want to delete this deployment target? Any app that is using this deployment target will use the default deployment target instead unlese you re-configure.", function(){
      var targetGuid = data[0];
      self.model.deployTarget['delete'](targetGuid, function(res){
        self.showAlert("success", "<strong>Deletion successful</strong>");
        self.target_list_table.fnDeleteRow(row[0]);
      }, function(err){
        self.showAlert("error", "<strong>Deletion failed. Error : </strong>" + err);
      });
    });
  },

  showCreateTarget: function(){
    this.showTargetEditArea();
  },

  showTargetEditArea: function(data){
    this.container = this.views.target_edit;
    var self = this;
    var isCreate = data == null;
    var headerText = "<ACTION> a Deploy Target";
    var btnText = "<ACTION> Target";
    if(isCreate){
      headerText = headerText.replace(/<ACTION>/, 'Create');
      btnText = btnText.replace(/<ACTION>/, 'Create');
    } else {
      headerText = headerText.replace(/<ACTION>/, 'Update');
      btnText = btnText.replace(/<ACTION>/, 'Update');
    }
    $(self.views.target_edit + " #target_edit_header").text(headerText);
    $(self.views.target_edit + " #save_deploy_target_btn").text(btnText);
    
    self.populateValidTargets(data);
    self.hide();
    $(self.views.target_edit).show();
    $(self.views.target_edit + " #cancel_deploy_target_btn").unbind("click").bind("click", function(){
      self.show();
    });
    if(isCreate){
      self.resetFields();
      $(self.views.target_edit + " #save_deploy_target_btn").unbind("click").bind("click", function(){
        self.saveDeployTarget();
      });
    } else {
      self.resetFields();
      self.populateDataFields(data);
      $(self.views.target_edit + " #save_deploy_target_btn").unbind("click").bind("click", function(){
        self.saveDeployTarget(data.id);
      });
    }
  },

  resetFields: function(){
    var self = this;
    $(self.views.target_edit + " #deploy_target_name").val("");
    $(self.views.target_edit + " #deploy_target_platform").data("selected_target", null);
    $(self.views.target_edit + " .deploy_target_option").removeClass("active");
    $(self.views.target_edit + " #deploy_target_envs input[type=checkbox]").removeAttr("checked");
    $(self.views.target_edit + " .target-settings input").val("");
    $(self.views.target_edit + " .target-settings select").empty();
    $(self.views.target_edit + " .target-settings").hide();
  },

  populateDataFields: function(data){
    var self = this;
    $(self.views.target_edit + " #deploy_target_name").val(data.name);
    $(self.views.target_edit + " .target_" + data.target.toLowerCase()).click();
    if(data.env.indexOf("dev") > -1){
      $(self.views.target_edit + " #deploy_target_envs #deploy_target_env_dev").attr("checked", "checked");
    }
    if(data.env.indexOf("live") > -1){
      $(self.views.target_edit + " #deploy_target_envs #deploy_target_env_live").attr("checked", "checked");
    }
  },

  populateInfrastructureOptions: function(t){
    var self = this;
    if(self[t.id + "_valid_infrastructures"]){
      $(self.views.target_edit + " .target-settings #deploy_target_setting_infrastructure").empty();
      var providers = self[t.id + "_valid_infrastructures"];
      for(var i=0;i<providers.length;i++){
        var opt = $("<option>", {"text":providers[i].label, "value": providers[i].value});
        $(self.views.target_edit + " .target-settings #deploy_target_setting_infrastructure").append(opt);
      }
    }
  },

  populateValidTargets: function(selected){
    var self = this;
    var targetList = $(self.views.target_edit + " #deploy_target_platform ul");
    targetList.empty();
    var globalValidTargets = $fw.getClientProp('nodejsValidTargets');
    if(globalValidTargets){
      globalValidTargets = globalValidTargets.split(",");
    }
    for(var i=0;i<self.valid_targets.length;i++){
      var target = self.valid_targets[i];
      if(globalValidTargets){
        if(globalValidTargets.indexOf(target.id) === -1){
          continue;
        }
      }
      var target_li = $("<li>");
      var target_div = $("<div>", {"class":"btn deploy_target_option target_" + target.id});
      var target_img = $("<img>", {"src": self.STATIC_IMAGE_PREFIX + target.icon, "class":"image-rounded"});
      var target_text = $("<h5>", {"text": target.name});
      target_div.data("target_val", target.id);
      if(selected && selected.target && target.id === selected.target.toLowerCase()){
        target_div.addClass("active");
      }
      target_div.append(target_img).append(target_text);
      target_li.append(target_div);
      targetList.append(target_li);
      target_div.unbind("click").bind("click", function(target){
        return function(e){
          $(self.views.target_edit + " #deploy_target_platform .deploy_target_option").removeClass("active");
          $(this).addClass("active");
          $(self.views.target_edit + " #deploy_target_platform").data("selected_target", target.id);
          console.log("selected target is " + $(self.views.target_edit + " #deploy_target_platform").data("selected_target"));
          var targetConf = target.configurations;
          for(var confKey in targetConf){
            if(targetConf[confKey] === true){
              $(self.views.target_edit + " .target-settings-" + confKey).show();
              if(confKey === "infrastructure"){
                self.populateInfrastructureOptions(target);
              }
            } else {
              $(self.views.target_edit + " .target-settings-" + confKey).hide();
            }
          }
          if( selected && target.id === selected.target.toLowerCase()){
            if(selected.configurations.url){
              $(self.views.target_edit + " .target-settings #deploy_target_setting_url").val(selected.configurations.url);
            }
            if(selected.configurations.username){
              $(self.views.target_edit +" .target-settings #deploy_target_setting_username").val(selected.configurations.username);
              $(self.views.target_edit +" .target-settings #deploy_target_setting_password").val("**********");
            }
            if(selected.configurations.infrastructure){
              $(self.views.target_edit + " .target-settings #deploy_target_setting_infrastructure").val(selected.configurations.infrastructure);
            }
          } else {
            $(self.views.target_edit + " .target-settings input").val("");
          }
        };
      }(target));
    }
  },

  saveDeployTarget:function(target_id){
    var self = this;
    var targetName = $(self.views.target_edit + " #deploy_target_name").val();
    var targetId = $(self.views.target_edit + " #deploy_target_platform").data("selected_target");
    var targetEnv = "";
    if($(self.views.target_edit + " #deploy_target_envs #deploy_target_env_dev").attr("checked")){
      targetEnv += "dev";
    }
    if($(self.views.target_edit + " #deploy_target_envs #deploy_target_env_live").attr("checked")){
      targetEnv += ",live";
    }

    var url = $(self.views.target_edit + " .target-settings #deploy_target_setting_url").val();
    var username = $(self.views.target_edit +" .target-settings #deploy_target_setting_username").val();
    var password = $(self.views.target_edit +" .target-settings #deploy_target_setting_password").val();
    var infrastructure = $(self.views.target_edit + " .target-settings #deploy_target_setting_infrastructure").val();
    if(password === "**********"){
      password = undefined;
    }

    var config = {};
    if(url && url !== ""){
      config.url = url;
    }
    if(username && username !== ""){
      config.username = username;
    }
    if(password && password !== ""){
      config.password = password;
    }
    if(infrastructure && infrastructure !== ""){
      config.infrastructure = infrastructure;
    }

    if(target_id){
      self.model.deployTarget.update(target_id, targetName, targetId, targetEnv, config, function(res){
        self.showAlert("success", '<strong> Updating successful </strong>');
      }, function(err){
        self.showAlert("error", '<strong> Updating Failed. Error : '+ err +' </strong>');
      });
    } else {
      self.model.deployTarget.create(targetName, targetId, targetEnv, config, function(res){
        self.showAlert("success", '<strong> Creation successful </strong>');
      }, function(err){
        self.showAlert("error", '<strong> Creation Failed. Error : '+ err +' </strong>');
      });
    }
  }
});
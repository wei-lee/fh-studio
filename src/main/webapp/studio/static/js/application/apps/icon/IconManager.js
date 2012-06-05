application.IconManager = Class.extend({
  ICON_TYPE_SMALL: 'small',
  ICON_TYPE_LARGE: 'large',

  init: function () {
    this.icon_sizes = {
      'small': '16x16px',
      'large': '96x96px'
    };
    this.container = null;
  },

  setContainer: function (container) {
    this.container = container;
  },

  showIcons: function (instance_guid) {
    this.container.empty();
    var icon_table = $('<table>', {
      'id': 'app_icons_table',
      'col': 3,
      'border': 0
    });
    for (var type in this.icon_sizes) {
      icon_table.append(this.constructIcon(instance_guid, type));
    }
/*
     for(var i = 0; i < this.icon_types.length; i++){
         var type = this.icon_types[i];
         icon_table.append(this.constructIcon(instance_guid, type));
     }*/
    this.container.html(icon_table);
  },

  getIconUrl: function (instance_guid, type) {
    var base_url = Constants.APP_ICON_URL.replace("<GUID>", instance_guid).replace("<TYPE>", type);
    // get an uncached version of the image
    base_url += ("?t=" + new Date().getTime());
    return base_url;
  },

  // TODO: a lot of html construction here. Is this necessary?
  constructIcon: function (instance_guid, type) {
    var icon_tr = $("<tr>", {
      'class': 'app_icon_div_' + type
    });
    var icon_label = $("<label>", {
      'text': js_util.capitalise(type)
    });
    var icon_label_text = $('<label>', {
      'text': '(' + this.icon_sizes[type] + ')'
    });
    var td_l = $("<td>", {
      'class': 'app_icon_label'
    });
    td_l.append(icon_label).append(icon_label_text);
    var icon_img_td = $("<td>", {
      'class': 'app_icon_img_bg'
    });
    var icon_img_bg = $("<div>", {
      'class': 'app_icom_img_bg_div'
    });
    var icon_img = $("<img>", {
      'class': 'app_icon_img app_icon_img_' + type,
      'src': this.getIconUrl(instance_guid, type)
    });
    icon_img_td.append(icon_img_bg.append(icon_img));
    var td_b = $("<td>", {
      'class': 'app_icon_upload'
    });
    var icon_upload_button = $("<button>", {
      'text': 'Change',
      'class': 'btn'
    });
    var that = this;
    icon_upload_button.bind('click', function () {
      that.doUploadIcon(instance_guid, type);
    });
    td_b.append(icon_upload_button);
    icon_tr.append(td_l).append(icon_img_td).append(td_b);
    return icon_tr;
  },
  
  reloadIcon: function(instance_guid, type){
    this.container.find('img.app_icon_img_' + type).attr('src', this.getIconUrl(instance_guid, type));  
  },

  doUploadIcon: function (instance_guid, type) {
    var that = this;
    Log.append('instance::' + instance_guid + "::type::" + type);
    
    var upload_wizard = proto.Wizard.load('upload_icon_wizard', {
      validate: true
    });
    upload_wizard.validate({
      rules: {
        location: 'required'
      }
    });
    
    Log.append("icon upload:: bind show events");
    upload_wizard.find('#upload_icon_progress').unbind().bind('show', function () {
      Log.append('doing upload');
      var step = $(this);
      
      // TODO: tidy up all these calls and refactor
      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog.append(step, 'Starting Upload');
      Log.append('icon path :: ' + upload_wizard.find('#icon_file_location').val());
      
      var params = {
        'widgetGuid': $fw_manager.data.get('app').guid,
        'templateGuid': instance_guid,
        'code': type
      };
      
      $fw_manager.client.model.App.uploadIcon( upload_wizard.find('#icon_file_location'), params,
        function () {
          proto.ProgressDialog.setProgress(step, 100);
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_complete'));
          
          // TODO: better way for this temporary workaround for finishing wizard after successful upload  
          upload_wizard.find('.jw-button-finish').trigger('click');
          that.reloadIcon(instance_guid, type);
        },
        function (res) {
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_failed'));
          proto.Wizard.previousStep(upload_wizard, res.error);
        },
        5000
      );
    });
  }
})
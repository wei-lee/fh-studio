var Apps = Apps || {};

Apps.Libraries = Apps.Libraries || {};

Apps.Libraries.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    manage_frameworks_container: "#manage_frameworks_container"
  },

  container: null,
  showPreview: true,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function () {
    var self = this;
    
    $('#manage_frameworks_update_button').bind('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      self.doUpdateFrameworks();
    });
  },

  show: function(){
    this._super();
    
    this.hide();

    this.initFn();
    this.container = this.views.manage_frameworks_container;
    this.showCurrentFrameworks();
    $(this.container).show();
  },
  
  showCurrentFrameworks: function(){
    var self = this;

    var contentHtml = self.getAppFramworksHtml();
    $(this.container).find('#app_libraries').html(contentHtml);
    var app = $fw.data.get('app');
    var frameworks = app.frameworks;
    if(frameworks && frameworks.length > 0){
      for(var i=0;i<frameworks.length;i++){
        var fw_key = frameworks[i];
        var dom_id = fw_key.replace(/\./g, "_") + "_check";
        var dom = $('#app_libraries').find('#' + dom_id);
        $(dom).attr('checked', true);
      }
    }
  },
  
  getAppFramworksHtml: function(){
    var fw_options = $fw.getClientProp('appFrameworks');
    var getFwHtml = function(fw){
      var dom_id = fw.key.replace(/\./g, "_") + "_check";
      var html = "<td><input type='checkbox' id='"+ dom_id +"' ";
      html += "value='"+fw.key+"' />";
      html += "<label for='" + dom_id + " '>";
      html += fw.name.replace('_', ' ') + "  (v" + fw.version + ")";
      html += "</label></td>";
      return html;
    };
    var contentHtml = "<table><tr>";
    var column = 3;
    for(var i=0;i<fw_options.length;i++){
      var fw = fw_options[i];
      contentHtml += getFwHtml(fw);
      if(((i+1)%column === 0) || (i === (fw_options.length - 1))){
        contentHtml += "</tr>";
        if(i != fw_options.length - 1){
            contentHtml += "<tr>";
        }
      }
    }
    return contentHtml;
  },
  
  doUpdateFrameworks: function(){
    var selected_fws = $('#app_libraries').find('input[type=checkbox]:checked');
    var fw_values = [];
    for(var i=0;i<selected_fws.length;i++){
        fw_values.push($(selected_fws[i]).val());
    }
    var guid = $fw.data.get('app').guid;
    $fw.client.model.App.updateFrameworks(guid, fw_values, function(res){
      var app = $fw.data.get('app');
      app.frameworks = fw_values;
      $fw.data.set('app', app);
      $fw.client.dialog.info.flash($fw.client.lang.getLangString('app_frameworks_updated'));
    }, function(err){
        $fw.client.dialog.error(error);
    });
  }

});
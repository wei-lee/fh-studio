application.DestinationEmbed = application.DestinationGeneral.extend({

  init: function (dest_id) {
    this._super(dest_id);
  },

  /*
   * Determine the script embed code and display it to the user
   */
  publish: function () {
    console.log("Embed :: Publish");
    var guid = $fw.data.get('inst').guid;
    var that = this;
    if($fw.getClientProp('nodejsEnabled') === "true"){
      $.get(this.base_url + "?checktype=true", function(res){
        if(res.result){
          var main_container = $('#manage_publish_container');
          main_container.find(".dashboard-content").hide();
          that.enableButton(main_container.find("#app_embed_build_debug"), "dev", "Current URL is : " + res.dev_url);
          that.enableButton(main_container.find("#app_embed_build_release"), "live", "Current URL is : " + res.live_url);
          main_container.find('#app_publish_' + that.destination_id + '_build').show();
          main_container.find("#app_publish_" + that.destination_id).show();

        } else {
          var tag = Constants.EMBED_APP_TAG.replace('<GUID>', guid);
          that.generateEmbedScript(tag);
        }
      });
    } else {
      var tag = Constants.EMBED_APP_TAG.replace('<GUID>', guid);
      that.generateEmbedScript(tag);
    }
    

  },

  getPublishData: function (config, versions_select, wizard) {
    return {
      'config':config === "dev" ? "debug" : "release",
      'generateSrc':false
    };
  },

  handleDownload: function(res){
    this.generateEmbedScript("<script src='" + res.action.url + "' ></script>");
  },

  generateEmbedScript: function(tag){
    // create modal dialog structure with textarea for embed code 
    var el = $('<div>', {
    }).append($('<p>',{
      text: $fw.client.lang.getLangString('publish_embed_text')
    })).append($('<textarea>', {
      id: 'embed_code',
      value: tag,
      readonly: true
    })).appendTo($(document));
    
    // setup close button
    var buttons = {};
    buttons[$fw.client.lang.getLangString('generic_close')] = function () {
      $(this).dialog('close');
    };
    
    // initialise modal dialog with dialog content
    var dialog = proto.Dialog.load(el, {
      modal: true,
      closeOnEscape: true,
      autoOpen: true,
      dialogClass: 'publish-dialog',
      width: 400,
      title: $fw.client.lang.getLangString('publish_embed_title'),
      buttons: buttons
    });
    
    // select the embed code
    dialog.find('#embed_code').focus().select();
  }
});
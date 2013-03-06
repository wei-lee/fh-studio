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
          if(that.base_url.indexOf("?node=true") === -1){
            that.base_url = that.base_url + "?node=true";
          }
          var main_container = $('#manage_publish_container');
          main_container.find(".dashboard-content").hide();
          if(res.dev_error){
            that.disableButton(main_container.find("#app_embed_build_debug"), "dev", res.dev_error);
          } else {
            var btn = main_container.find("#app_embed_build_debug");
            var embed = that.generateNewEmbedScript(res.dev_url, "development", false);
            that.enableButton(btn, "dev", embed);
          }

          if(res.live_error){
            that.disableButton(main_container.find("#app_embed_build_release"), "live", res.live_error);
          } else {
            var btn = main_container.find("#app_embed_build_release");
            var embed =  that.generateNewEmbedScript(res.live_url, "live", false);
            that.enableButton(btn, "live", embed);
          }
          main_container.find('#app_publish_' + that.destination_id + '_build').show();
          main_container.find("#app_publish_" + that.destination_id).show();

        } else {
          var tag = Constants.EMBED_APP_TAG.replace('<GUID>', guid);
          that.generateOldEmbedScript(tag);
        }
      });
    } else {
      var tag = Constants.EMBED_APP_TAG.replace('<GUID>', guid);
      that.generateOldEmbedScript(tag);
    }
  },

  getPublishData: function (config, versions_select, wizard) {
    return {
      'config':config === "dev" ? "debug" : "release",
      'generateSrc':false
    };
  },

  handleDownload: function(res, config){
    var env = config === "dev" ? "development" : "live";
    var el = this.generateNewEmbedScript(res.action.url, env, true);
    this.showDialog(el, 500);
  },

  generateNewEmbedScript: function(url, env, afterdeploy){
    var el = $("<div>", {});
    if(url){
      var html = "";
      if(!afterdeploy){
        html += "The "+env+" embeded app has been already been packaged/built.";
      } else {
        html += "The "+env+" embeded app has been packaged/built.";
      }
      html += "You can view the app from <a target='_blank' href='"+url+"' >here</>.";
      var p = $("<p>", {html:html});
      var p1 = $("<p>", {text:"To embed this app in other website, you can copy and paste any of the following code:"});
      var pre1 = $("<pre>");
      var c1 = $("<code>", {text:"<iframe src='"+url+"' border='0' frameborder='0' ></iframe>", css:{color:'black'}});
      pre1.append(c1);
      var p2 = $("<p>", {text:"Or"});
      var pre2 = $("<pre>");
      var c2 = $("<code>", {text:"<script>\ndocument.write(\"<div><iframe src='"+url+"' border='0' frameborder='0'></iframe></div>\");\n</script>", css:{color:'black'}});

      var note = $("<p>").html($("<b>", {text: "(Note: if you have made any changes since the last build, you must be rebuild now or you will not see your changes.)"}));
      pre2.append(c2);
      el.append(p).append(p1).append(pre1).append(p2).append(pre2).append(note);
    } else {
      var p3 = $("<p>", {text:"The "+env+" embeded app hasn't been  packaged/built."});
      el.append(p3);
    }
    return el;
  },

  generateOldEmbedScript: function(tag){
    // create modal dialog structure with textarea for embed code
    var el = $('<div>', {
    }).append($('<p>',{
      text: $fw.client.lang.getLangString('publish_embed_text')
    })).append($('<textarea>', {
      'class': 'embed_code',
      value: tag,
      readonly: true
    })).appendTo($(document));

    this.showDialog(el, 400);
  },

  showDialog: function(el, width){
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
      width: width,
      title: $fw.client.lang.getLangString('publish_embed_title'),
      buttons: buttons
    });

    // select the embed code
    dialog.find('.embed_code').focus().select();
  },

  disableButton: function(button, type, text) {
    button.find("h3").parent().find("button.resource-uploaded").hide();
    button.find('.resource-content').text(text);
  }
});
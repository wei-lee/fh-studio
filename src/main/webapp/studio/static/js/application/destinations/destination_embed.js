application.DestinationEmbed = application.DestinationGeneral.extend({

  init: function (dest_id) {
    this._super(dest_id);
  },

  /*
   * Determine the script embed code and display it to the user
   */
  publish: function () {
    Log.append("Embed :: Publish");
    
    // get the embed code string
    var guid = $fw_manager.data.get('inst').guid;
    var tag = Constants.EMBED_APP_TAG.replace('<GUID>', guid);
    
    // create modal dialog structure with textarea for embed code 
    var el = $('<div>', {
    }).append($('<p>',{
      text: $fw_manager.client.lang.getLangString('publish_embed_text')
    })).append($('<textarea>', {
      id: 'embed_code',
      value: tag,
      readonly: true
    })).appendTo($(document));
    
    // setup close button
    var buttons = {};
    buttons[$fw_manager.client.lang.getLangString('generic_close')] = function () {
      $(this).dialog('close');
    };
    
    // initialise modal dialog with dialog content
    var dialog = proto.Dialog.load(el, {
      modal: true,
      closeOnEscape: true,
      autoOpen: true,
      dialogClass: 'publish-dialog',
      width: 400,
      title: $fw_manager.client.lang.getLangString('publish_embed_title'),
      buttons: buttons
    });
    
    // select the embed code
    dialog.find('#embed_code').focus().select();
  }
});
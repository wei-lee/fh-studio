var Apps = Apps || {};

Apps.Configuration = Apps.Configuration || {};
Apps.Configuration.Blackberry = Apps.Configuration.Blackberry || {};

Apps.Configuration.Blackberry.Controller = Apps.Configuration.Support.extend({
  destination: 'blackberry',

  init: function() {
    this._super();
    this.hiddenOptions = {
      'auto Rotate': true,
      'flurry Application Key': true,
      'orientation': true,
      'status': true,
      'version Name': true
    };
  },

  validateForm: function() {
    var bgColor = $(".config_option[name='splash Background Color']").val();
    if (bgColor !== "") {
      if (bgColor.length != 7 || bgColor.charAt(0) != "#") {
        $fw.client.dialog.error("The background color should be hexadecimal value.");
        return false;
      }
    }
    return true;
  }

});
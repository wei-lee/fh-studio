App.View.Modal = Backbone.View.extend({
  options: null,
  defaults: {
    okText : 'OK',
    cancelText : 'Cancel',
    title : 'Confirm',
    body : 'Are you sure you want to do this?'
  },
  events : {
    'click #modal-ok' : 'modalOk',
    'click #modal-cancel' : 'modalCancel'
  },
  initialize: function(options) {
    _.bindAll(this);
    this.defaults.id = 'modal-' +  Math.floor((Math.random()*10000));
    this.options = $.extend({}, this.defaults, options);
  },

  render: function() {
    var self = this;
    var template = Handlebars.compile($("#modal-template").html());
    var dialog = $(template(this.options));
    if (this.options.cancelText && this.options.cancelText === false){
      dialog.find('#modal-cancel').remove();
    }
    this.$el.append(dialog);
    this.$el.find('#' + this.options.id).modal();
    return this;
  },
  modalOk : function(){
    if (typeof this.options.ok === 'function'){
      this.options.ok.apply(this, arguments);
    }
    this.remove();
  },
  modalCancel : function(){
    if (typeof this.options.cancel === 'function'){
      this.options.cancel.apply(this, arguments);
    }
    this.remove();
  }
});
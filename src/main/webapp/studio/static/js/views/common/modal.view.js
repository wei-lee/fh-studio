App = App || {};
App.View = App.View || {};
App.View.Modal = Backbone.View.extend({
  options: null,
  defaults: {
    okText : 'OK',
    cancelText : 'Cancel',
    title : 'Confirm',
    body : 'Are you sure you want to do this?',
    dismiss : 'modal'
  },
  events : {
    'click #modal-ok' : 'modalOk',
    'click #modal-cancel' : 'modalCancel'
  },
  initialize: function(options) {
    _.bindAll(this);
    this.defaults.id = 'modal-' +  Math.floor((Math.random()*10000));
    this.options = $.extend({}, this.defaults, options);
    if (this.options.autoHide === false){
      this.options.dismiss = '';
    }
  },
  render: function() {
    var self = this;
    var template = Handlebars.compile($("#modal-template").html());
    var dialog = $(template(this.options));
    // Dynamically add in body, not as HTML string so we can interact with it later
    dialog.find('.modal-body').append(this.options.body);
    if (this.options.hasOwnProperty('cancelText') && this.options.cancelText === false){
      dialog.find('#modal-cancel').remove();
    }
    this.$el.append(dialog);
    this.$el.find('#' + this.options.id).modal().on('shown', function () {
      self.$el.find('#' + self.options.id).find('input,textarea,select').filter(':visible:first').focus();
    });
    return this;
  },
  modalOk : function(){
    var self = this,
    modalEl = this.$el.find('.modal'),
    close = true;
    if (typeof this.options.ok === 'function'){
      // Call our OK callback since it exists, if it returns false, don't close.
      this.options.ok.apply(this, arguments);
    }
  },
  modalCancel : function(){
    if (typeof this.options.cancel === 'function'){
      this.options.cancel.apply(this, arguments);
    }
    this.remove();
  },
  close : function(){
    var self = this,
    modalEl = this.$el.find('.modal');
    modalEl.modal('hide');
    modalEl.on('hidden', function(){
      self.remove();
    });
  }
});
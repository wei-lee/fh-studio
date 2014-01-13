var App = App || {};
App.View = App.View || {};

App.View.FormNotifications = App.View.Forms.extend({
  templates : {
    form_back : '#form_back',
    form_notifications : '#form_notifications'
  },
  initialize: function(options){
    var self = this;
    this.constructor.__super__.initialize.apply(this, arguments);
    this.collection = new App.Collection.FormNotifications();
    this.collection.fetch({
      success : function(){
        self.loaded = true;
        self.render();
      }
    });
    this.options = options;
  },
  events : {
    'click .btn-forms-back' : 'onBack',
    'click .btn-add-email-notification' : 'onAddEmail',
    'click .btn-remove-email' : 'onRemoveEmail',
    'click .btn-save-notifications' : 'onSaveNotifications',
    'change select' : 'onSelectChanged'
  },
  render : function(){
    this.$el.empty();
    if (!this.loaded){
      return this; // TODO Loading
    }

    var form  = this.options.form;
    this.$el.addClass('formNotifications');
    this.$el.append('<h4 class="title">' + form.get('name') + ' Notifications</h4>');
    this.$el.append(this.templates.$form_back());
    this.$el.append(this.templates.$form_notifications( { emails : this.collection.toJSON() } ));
    return this;
  },
  onBack : function(){
    this.trigger('back');
  },
  onAddEmail : function(){
    var email = this.$el.find('#inputEmail').val();
    //TODO: Validate?
    this.$el.find('select').append('<option>' + email + '</option>');

    this.$el.find('#inputEmail').val('');
  },
  onSaveNotifications : function(){
    var self = this,
    subscribers = [];
    this.$el.find('select option').each(function(el){
      subscribers.push({email : $(this).html() });
    });
    this.collection.sync('update', subscribers, {reset : true, success : function(){
      self.onBack();
      self.message('Form notifications updated successfully');
    }, error : function(){
      self.message('Error updating form notifications', 'danger');
    }});
  },
  onSelectChanged : function(){
    var select = this.$el.find('select');
    var selected = select.val();
    if (selected && selected.length && selected.length>0){
      this.$el.find('.btn-remove-email').removeClass('disabled');
    }else{
      this.$el.find('.btn-remove-email').addClass('disabled');
    }
  },
  onRemoveEmail : function(){
    $('select option:selected').remove();
  }
});
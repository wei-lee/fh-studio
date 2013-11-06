var App = App || {};
App.View = App.View || {};

App.View.FormCreate = App.View.Modal.extend({
  initialize: function(options){
    var tpl = Handlebars.compile($('#formsModalCreateBody').html()),
    body = $(tpl());
    this.options = options = {
      title: 'Create New Form',
      okText: 'Create',
      ok : this.ok,
      body : body,
      collection : options.collection
    };

    return this.constructor.__super__.initialize.apply(this, [options]);

  },
  ok: function (e) {
    var self = this,
    form = this.$el.find('form'),
    vals = {
      "DateUpdated" : new Date().toString(),
      "Pages": [
        { "Fields": [] }
      ]
    };
    $($(form).serializeArray()).each(function(idx, el){
      vals[el.name] = el.value;
    });
    this.collection.add(vals);
    this.collection.sync('create', vals, { success : function(res){
      self.collection.trigger('reset');
      self.trigger('message', 'Form created');
    }, error : function(err){
      self.trigger('message', 'Error creating form');
      console.log('Error creating form');
      console.log(err);
    }});

  },
  doCreateForm: function (sectionParams) {

  }
});
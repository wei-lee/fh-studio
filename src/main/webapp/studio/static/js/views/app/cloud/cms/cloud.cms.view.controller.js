var App = App || {};
App.View = App.View || {};

App.View.CMSController  = Backbone.View.extend({

  events: {
    'click .btn-listfield-structure' : 'onListFieldEditStructure',
    'click .btn-listfield-data' : 'onListFieldEditStructure',
    'click .btn-cms-back' : 'onCMSBack'
  },

  templates : {
    'cms_left' : '#cms_left'
  },
  initialize: function(){
    var self = this;
    this.compileTemplates();
    this.collection = new App.Collection.CmsSection();
    this.collection.fetch({ reset: true});
    this.collection.bind('reset', $.proxy(this.render, this));
  },
  render: function(){
    this.$el.empty();

    if (!this.collection.loaded){
      this.$el.append('Loading...');
      return this;
    }

    this.section = this.section || this.collection.at(0) && this.collection.at(0).get('path');

    if (!this.section){
      alert("Error loading section"); //TODO: Modal
      console.log('Error: no section specified when initing cloud.cms.view');
    }

    this.$el.addClass('row nomargin');


    /*
     Formbuilder doesn't render well with an invisible el - DnD doesn't work.
     It needs to be already on the page => we work around this requirement here
     with 2 containers, one for section edit, one for list field edit
     */
    this.$fbContainer = $('<div></div>');
    this.$listFieldContainer = $('<div></div>'); // Contains subviews of FormBuilder for list fields
    this.$el.prepend(this.$fbContainer);
    this.$el.prepend(this.$listFieldContainer);

    this.form = new App.View.CMSSection({ $el : this.$fbContainer, collection : this.collection, section : this.section });
    this.form.render();

    this.tree = new App.View.CMSTree({collection : this.collection});
    this.$el.prepend(this.templates.$cms_left());
    this.$el.find('.treeContainer').append(this.tree.render().$el);
    this.tree.bind('sectionchange', $.proxy(this.form.setSection, this.form));


    return this;
  },
  compileTemplates: function() {
    var templates = {};
    for (var key in this.templates){
      if (this.templates.hasOwnProperty(key)){
        var tpl = this.templates[key],
        html = $(tpl, this.$container).html();
        if (!html){
          throw new Error("No html found for " + key);
        }
        templates['$' + key] = Handlebars.compile(html);
      }
    }
    this.templates = templates;
  },
  onListFieldEditStructure : function(e){
    var el = $(e.target);
    this.$fbContainer.hide();
    this.$listFieldContainer.empty().show();
    //TODO: Pass section, field_list and other useful stuff to this here
    //TODO: This should probably be passed by bubbling an event from this.form..?
    //TODO: field: should come from formbuilder..
    this.form = new App.View.CMSListField({ $el : this.$listFieldContainer, collection : this.collection, section : this.form.section, field : 'Patrick St List' });
    this.form.render();
    //TODO: New screen
  },
  onListFieldEditData : function(e){
    //TODO - similar to above but with additional table view on top
  },
  onCMSBack : function(e){
    this.$listFieldContainer.empty().hide();
    this.$fbContainer.show();
  }
});
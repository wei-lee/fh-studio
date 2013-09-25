var App = App || {};
App.View = App.View || {};

App.View.CMS = Backbone.View.extend({

  events: {

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

    this.section = this.section || this.collection.at(0) && this.collection.at(0).get('hash');

    if (!this.section){
      alert("Error loading section"); //TODO: Modal
      console.log('Error: no section specified when initing cloud.cms.view');
    }

    this.$el.addClass('row nomargin');

    this.form = new App.View.CMSSection({collection : this.collection, section : this.section });
    this.$el.prepend(this.form.render().$el);

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
});
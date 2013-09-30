var App = App || {};
App.View = App.View || {};

App.View.CMSController  = Backbone.View.extend({

  events: {
    'click .btn-cms-back' : 'onCMSBack'
  },

  templates : {
    'cms_left' : '#cms_left',
    'cms_mastermenu' : '#cms_mastermenu'
  },
  initialize: function(options){
    this.options = options;
    var self = this;
    this.compileTemplates();
    this.collection = new App.Collection.CmsSection();
    this.collection.fetch({ reset: true});
    this.collection.bind('reset', $.proxy(this.render, this));
    App.dispatch.on("cms.sectionclick",self.updateSelect);
  },

  updateSelect : function (data) {
    console.log("update select ", data);
    $('option:selected', 'select[name="parentName"]').removeAttr('selected');
    $('select[name="parentName"]').find("option[data-path='"+data.path+"']").attr("selected",true);
  },

  render: function(options){
    this.$el.empty();

    if (!this.collection.loaded){
      this.$el.append('Loading...');
      return this;
    }

    if ($(this.options.container).find('.fh-box-header .cms_mastermenu').length===0){
      $(this.options.container).find('.fh-box-header').append(this.templates.$cms_mastermenu());
    }

    this.section = this.section || this.collection.at(0) && this.collection.at(0).get('path');

    if (!this.section){
      console.log('Error: no section specified when initing cloud.cms.view');
      return this.modal("Error loading section");
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

    var isAdministrator = $fw.userProps.roles.indexOf('cmsadmin'); //TODO: Wire this up - doesn't exist yet
    this.form = new App.View.CMSSection({ $el : this.$fbContainer, collection : this.collection, section : this.section, editStructure : true }); //

    this.form.render();

    this.form.bind('edit_field_list', $.proxy(this.onEditFieldList, this));

    this.tree = new App.View.CMSTree({collection : this.collection});
    this.$el.prepend(this.templates.$cms_left());
    this.$el.find('.treeContainer').append(this.tree.render().$el);
    this.tree.bind('sectionchange', $.proxy(this.treeNodeClicked, this));
    this.tree.bind('sectionchange', $.proxy(this.form.setSection, this.form));


    return this;
  },
  onEditFieldList : function(options){
    this.$fbContainer.hide();
    this.$listFieldContainer.empty().show();
    options.$el = this.$listFieldContainer;
    this.listfield = new App.View.CMSListField(options);
    this.listfield.render();
    this.listfield.bind('back', $.proxy(this.onCMSBack, this));
  },
  onCMSBack : function(success){
    this.$listFieldContainer.empty().hide();
    this.$fbContainer.show();
    if (this.listField){
      this.listfield.undelegateEvents();
    }
    if (success === true){
      // Show save success message
      this.form.alertMessage();
    }
  },
  treeNodeClicked : function(){
    if (this.$listFieldContainer.length && this.$listFieldContainer.length>0){
      this.onCMSBack();
    }
  }
});
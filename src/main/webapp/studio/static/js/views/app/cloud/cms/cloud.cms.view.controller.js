var App = App || {};
App.View = App.View || {};

App.View.CMSController  = Backbone.View.extend({

  events: {
    'click .btn-cms-back' : 'onCMSBack',
    'click .btn-cms-publish' : 'showCMSPublishModal'
  },

  templates : {
    'cms_left' : '#cms_left',
    'cms_mastermenu' : '#cms_mastermenu'
  },
  "que":[],


  active : 'section',
  initialize: function(options){
    this.options = options;
    this.mode = options.mode || 'dev';
    var self = this;
    this.compileTemplates();

    // Initialise our audit controller
    this.audit = new App.View.CMSAudit();

    this.collection = new App.Collection.CMS();
    this.collection.fetch({ reset: true});
    this.collection.bind('reset', $.proxy(this.render, this));
    App.dispatch.bind('cms-checkUnsaved', $.proxy(this.checkUnsaved, this));
    App.dispatch.bind(CMS_TOPICS.SECTION_SAVE_DRAFT, $.proxy(this.onSaveDraft, this));
    App.dispatch.bind(CMS_TOPICS.SECTION_DISCARD_DRAFT, $.proxy(this.onDiscardDraft, this));
  },
  render: function(options){
    this.$el.empty();

    if (!this.collection.loaded){
      this.$el.append('Loading...');
      return this;
    }

    var modeString = (this.mode==="dev") ? "Live" : "Dev"; // "Copy to {{ mode }}"

    if ($(this.options.container).find('.fh-box-header .cms_mastermenu').length===0){

      $(this.options.container).find('.fh-box-header').append(this.templates.$cms_mastermenu({ mode : modeString }));
      // Bind the events - these aren't in this.$el alas
      $(this.options.container).find('.fh-box-header .btn-cms-audit').on('click', $.proxy(this.showAudit, this));
      $(this.options.container).find('.fh-box-header .btn-cms-import').on('click', $.proxy(this.showImport, this));
      $(this.options.container).find('.fh-box-header .btn-cms-export').on('click', $.proxy(this.showExport, this));
      $(this.options.container).find('.fh-box-header .btn-cms-publish').on('click', $.proxy(this.showCMSPublishModal, this));
      $(this.options.container).find('.fh-box-header .btn-cms-copy').on('click', $.proxy(this.showCopy, this));
    }
    // The button is only templated once - for every other mode switch, we need to replace the inner text of the button
    $(this.options.container).find('.btn-cms-copy span').html('Copy to ' + modeString);

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
    this.$auditContainer = $('<div></div>');
    this.$el.prepend(this.$fbContainer, this.$listFieldContainer, this.$auditContainer);

    var isAdministrator = $fw.userProps.roles.indexOf('cmsadmin'); //TODO: Wire this up - doesn't exist yet
    this.form = new App.View.CMSSection({ $el : this.$fbContainer, collection : this.collection, section : this.section, isAdministrator : true }); //

    this.form.render();

    this.form.bind('edit_field_list', $.proxy(this.onEditFieldList, this));

    this.$left = $(this.templates.$cms_left());
    this.tree = new App.View.CMSTree({collection : this.collection});
    this.$el.prepend(this.$left);
    this.$el.find('.cmsTreeContainer').append(this.tree.render().$el);
    this.tree.bind('sectionchange', $.proxy(this.treeNodeClicked, this));
    this.tree.bind('sectionchange', $.proxy(this.form.setSection, this.form));



    return this;
  },
  onEditFieldList : function(options){
    var self = this;
    App.dispatch.trigger('cms-checkUnsaved', function(){
      self.active = 'listfield';
      self.$fbContainer.hide();
      self.$listFieldContainer.empty().show();
      options.$el = self.$listFieldContainer;
      self.listfield = new App.View.CMSListField(options);
      self.listfield.render();
      self.listfield.bind('back', $.proxy(self.onCMSBack, self));
    });
  },
  onCMSBack : function(success){
//    App.dispatch.trigger('cms-checkUnsaved', function(){
//    });
    var self = this;
    switch(this.active){
      case "listfield":
        self.$listFieldContainer.empty().hide();
        if (self.listfield){
          self.listfield.undelegateEvents();
        }
        if (success === true){
          // Show save success message
          self.form.alertMessage();
        }
        self.form.render();
        break;
      case "audit":
        this.$auditContainer.hide();
        this.$auditContainer.empty();
        this.audit.undelegateEvents();
        this.$left.show();
        break;
      case "section":
        break;
    }
    // Always it's here we want to get back to
    this.$fbContainer.show();
  },
  treeNodeClicked : function(){
    if (this.$listFieldContainer.length && this.$listFieldContainer.length>0){
      //TODO: This call here causing some issues on first load & double renders happening..
      this.onCMSBack();
    }
  },
  showAudit : function(){
    this.active = 'audit';
    this.$listFieldContainer.hide();
    this.$fbContainer.hide();
    this.$left.hide();
    this.$auditContainer.empty().append(this.audit.render().$el).show();
  },
  showImport : function(){
    this.$el.append(new App.View.CMSImportExportCopy( { view : 'import' } ).render().$el);
  },
  showExport : function(){
    this.$el.append(new App.View.CMSImportExportCopy( { view : 'export' } ).render().$el);
  },
  showCopy : function(){
    this.$el.append(new App.View.CMSImportExportCopy( { view : 'copy', mode : this.mode } ).render().$el);
  },
  checkUnsaved : function(cb){
    var self = this,
    unsaved = this.tree.$el.find('.jstree-unsaved');
    if (unsaved.length > 0){
      var modal = new App.View.Modal({
        title: 'Unsaved Changes',
        body: "Are you sure you want to leave this page? You have unsaved changes",
        okText: 'Discard changes',
        cancelText : 'Cancel',
        ok: function(){
          self.tree.$el.find('.jstree-unsaved').removeClass('jstree-unsaved');
          cb();
        }
      });
      this.$el.append(modal.render().$el);
    }else{
      cb();
    }

  },
  // Enable discard draft an publish buttons - we now have a draft..
  onSaveDraft : function(){
    this.$el.find('.btn-discard-draft').attr('disabled', false);
    $(this.options.container).find('.fh-box-header .btn-cms-publish').attr('disabled', false);
    this.$el.find('.btn-cms-publish').attr('disabled', false);

  },
  onDiscardDraft : function(){
    // including .cmsTreeContainer here important, otherwise we pick up on the legend
    if (this.tree.$el.find('.cmsTreeContainer .jstree-draft').length===0){
      this.$el.find('.btn-discard-draft').attr('disabled', true);
      $(this.options.container).find('.fh-box-header .btn-cms-publish').attr('disabled', true);
      this.$el.find('.btn-cms-publish').attr('disabled', true);
    }

  },
  showCMSPublishModal : function(e){
    this.$el.append(new App.View.CMSImportExportCopy( { view : 'publish' } ).render().$el);
  },
  onCMSPublish : function(e){
    e.preventDefault();

    // Get our form as a JSON object
    var publishRadio = this.$el.find('input[name="publishRadio"]').val();

    // If publish is now, set the timedate if it's not already defined on the section
    if (publishRadio === "later"){
      this.section.publishDate = this.$el.find('#cmsDatePicker').val();
    }

    this.collection.sync('publish', {}, { success : function(){
      this.alertMessage('CMS published successfully');
      App.dispatch.trigger(CMS_TOPICS.SECTION_PUBLISH, this.sectionModel.toJSON()); // Notify the tree that we're saving the section so it can change colour
    }, error : function(){
      this.alertMessage('CMS publish failed');
    } });
  }
});
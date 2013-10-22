var App = App || {};
App.View = App.View || {};

App.View.CMSController  = Backbone.View.extend({

  events: {
    'click .btn-cms-back' : 'onCMSBack',
    'click .btn-cms-publish' : 'showCMSPublishModal'
  },

  templates : {
    'cms_left' : '#cms_left',
    'cms_mastermenu' : '#cms_mastermenu',
    'cms_sectionDropDown' : '#cms_sectionDropDown'
  },
  active : 'section',
  initialize: function(options){
    this.options = options;
    this.mode = options.mode || 'dev';
    var self = this;
    this.compileTemplates();

    // Initialise our audit controller
    this.audit = new App.View.CMSAudit();

    App.dispatch.bind('cms-checkUnsaved', $.proxy(this.checkUnsaved, this));
    App.dispatch.bind(CMS_TOPICS.SECTION_SAVE_DRAFT, $.proxy(this.onSaveDraft, this));
    App.dispatch.bind(CMS_TOPICS.SECTION_DISCARD_DRAFT, $.proxy(this.onDiscardDraft, this));
  },
  render: function(options){
    var self = this;
    this.$el.empty();


    // If not enabled, show the enable view
    var inst = $fw.data.get('inst'),
    enabled = inst.config && inst.config.app && inst.config.app.cms && inst.config.app.cms.enabled || "false";
    this.guid = inst.guid;
    if (enabled!=="true" && enabled!== true){
      return self.renderEnableView();
    }

    // Otherwise, CMS is already enabled - append loading & load the app dyno hosts
    self.$el.append('Loading...');

    if (!this.hosts){
      this.getHosts(function(err, res){
        if (err){
          //TODO
        }
        var url = self.hosts['development-url']; //todo

        self.$el.empty();

        self.collection = new App.Collection.CMS([], { url : url });
        self.collection.fetch({ reset: true});
        self.collection.bind('reset', $.proxy(self.render, self));
        return self.renderCMS();
      });
    }else{
      self.renderCMS();
    }
    return self;
  },
  renderEnableView : function(){
    this.message = new App.View.FullPageMessageView({ message : 'To use the Mobile CMS, it must be enabled.', button : 'Enable CMS &raquo;', cb :$.proxy(this.onCMSEnable, this)});

    this.$el.empty();
    this.$el.append(this.message.render().$el);
    return this;
  },
  renderCMS : function(){

    if (this.collection.length === 0){
      return this.renderEmptyCMSView();
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

    if (this.tempTree){
      // Remove the temp tree if we had an empty CMS & used it to create
      this.tempTree.remove();
    }

    this.tree = new App.View.CMSTree({collection : this.collection});
    this.$el.prepend(this.$left);
    this.$el.find('.cmsTreeContainer').append(this.tree.render().$el);
    this.tree.bind('sectionchange', $.proxy(this.treeNodeClicked, this));
    this.tree.bind('sectionchange', $.proxy(this.form.setSection, this.form));
    this.tree.bind('addsection', $.proxy(this.onAddSection, this));

    return this;
  },
  renderEmptyCMSView : function(){
    this.message = new App.View.FullPageMessageView({ message : 'Your CMS contains no sections', button : 'New Section &raquo;', cb :$.proxy(this.onCMSCreateSection, this)});

    this.$el.empty();
    this.$el.append(this.message.render().$el);
    return this;
  },
  onCMSEnable : function(){
    var self = this;
    var enableView = new App.View.CMSEnable();
    enableView.bind('enabled', function(){
      $.proxy(self.render(), self);
    });
    this.$el.append(enableView.render().$el);
  },
  onCMSCreateSection : function(){
    this.onAddSection();
    //TODO
  },
  "onAddSection": function (element) {
    var self = this;
    var parentOptions = self.collection.toHTMLOptions(),
    body;
    parentOptions = ["<option value='' data-path='' >-Root</option>"].concat(parentOptions);
    parentOptions = parentOptions.join('');
    body = $(self.templates.$cms_sectionDropDown({"parentOptions":parentOptions}));

    body.find('select').val(self.activeSection); // TODO Fix me so active selection is the selected node in here..

    body.append('<br/> <input class="input-large" placeholder="Enter a Section name" id="newCollectionName">');

    var modal = new App.View.Modal({
      title: 'Create New Section',
      body: body,
      okText: 'Create',
      ok: function (e) {
        var el = $(e.target),
        input = el.parents('.modal').find('input#newCollectionName'),
        sectionIn = el.parents('.modal').find("select[name='parentName']").find('option').filter(":selected").data("path"),
        secVal = input.val();
        self.doCreateSection({ name : secVal.toString(), parent : sectionIn.toString()});
        console.log("Section parent section name ", secVal, sectionIn);
        if (self.tree){
          self.tree.activeSection = sectionIn;

        }
      }
    });
    self.$el.append(modal.render().$el);

  },
  //move to fh.cms
  doCreateSection: function (section) {
    var self = this,
    selectedSection = self.activeSection || "root",
    node;

    console.log("Create Section in", selectedSection);

    var parentSection = (selectedSection === "root") ? undefined : self.collection.findSectionByPath(selectedSection);
    var id = "temp-"+new Date().getTime();
    console.log("parent section is ", parentSection);
    var childrenKey = App.Model.CmsSection.CONST.CHILDREN;

    if (parentSection) {
      if (!parentSection[childrenKey]){
        parentSection[childrenKey] = [];
      }

      var path = (parentSection.path === "") ? section.name : parentSection.path + "." + section.name,
      node = {
        "path": path,
        "_id": id,
        "name": section.name,
        "data": section.name,
        "parent" : section.parent,
        "children": []
      };

      parentSection[childrenKey].push(node.hash);
    }else{
      //add new parent section
      node = {
        "path":section.name,
        "_id":id,
        "name":section.name,
        "data":section.name,
        "parent" : section.parent,
        "children":[]
      };
    }

    console.log("models ",self.collection.models);
    var model = new App.Model.CmsSection(node);
    self.collection.push(model);

    this.collection.sync('create', model.toJSON(), { success : function(res){
      self.form.alertMessage('Section successfully saved');
      self.collection.fetch({reset : true});
    }, error : function(err){
      self.form.alertMessage(err.toString(), 'danger');
    }});
    if (self.tree && self.tree.$el){
      self.tree.$el.jstree("unset_focus");
    }
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
    this.$el.append(new App.View.CMSImport().render().$el);
  },
  showExport : function(){
    this.$el.append(new App.View.CMSExport().render().$el);
  },
  showCMSPublishModal : function(e){
    var el = (e.target.nodeName.toLowerCase() === 'span') ? $($(e.target).parents('a')) : $(e.target);
    if (el.attr('disabled') === 'disabled' || el.attr('disabled') === true){
      return;
    }
    this.$el.append(new App.View.CMSPublish( { collection : this.collection, mode : this.mode } ).render().$el);
  },
  showCopy : function(){
    this.$el.append(new App.View.CMSPublish({mode : this.mode}).render().$el);
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
  getHosts : function(cb){
    var self = this,
    params = {
      guid : this.guid
    },
    url = Constants.APP_HOSTS_URL;
    $fw.server.post(url, params, function(res) {
      self.hosts = res.hosts;
      return cb(null, res);
    }, function(err){
      console.log(err);
      return cb(err);
    }, false);
  }
});
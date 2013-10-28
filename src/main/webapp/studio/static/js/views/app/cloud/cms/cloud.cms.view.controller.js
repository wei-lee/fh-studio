var App = App || {};
App.View = App.View || {};

App.View.CMSController  = Backbone.View.extend({

  events: {
    'click .btn-cms-back' : 'onCMSBack',
    'click .btn-cms-publish' : 'showCMSPublishModal',
    'click .btn-addsection' : 'onCreateSection',
    'click .btn-deletesection' : 'onDeleteSection'
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
    App.dispatch.bind(CMS_TOPICS.SECTION_SAVE_DRAFT, $.proxy(this.onSaveDraft, this));
    App.dispatch.bind(CMS_TOPICS.SECTION_DISCARD_DRAFT, $.proxy(this.onDiscardDraft, this));
  },
  render: function(options){
    var self = this;

    // If not enabled, show the enable view
    if (!this.checkIsEnabled()){
      return self.renderEnableView();
    }

    // Otherwise, CMS is already enabled - append loading
    this.renderLoading();

    // Then load hosts if needed & then actual CMS data
    if (!this.hosts){
      this.getHosts(function(err, res){
        if (err){
          self.$el.removeClass('busy');
          self.renderErrorView();
        }
        self.gotHosts();
      });
    }else{
      self.gotHosts();
    }
    return self;
  },
  renderLoading : function(){
    this.$el.empty();
    this.$el.addClass('busy');
    var tpl = Handlebars.compile($('#fullpageLoading').html());
    this.$el.append(tpl());
  },
  renderEnableView : function(){
    this.message = new App.View.FullPageMessageView({ message : 'To use the Mobile CMS, it must be enabled.', button : 'Enable CMS &raquo;', cb :$.proxy(this.onCMSEnable, this)});

    this.$el.empty();
    this.$el.append(this.message.render().$el);
    return this;
  },
  renderErrorView : function(){
    this.message = new App.View.FullPageMessageView({ message : 'Error loading CMS - is your cloud app running?', button : 'Retry &raquo;', cb :$.proxy(this.render, this)});

    this.$el.empty();
    this.$el.append(this.message.render().$el);
    return this;
  },
  gotHosts: function(){
    var self = this,
    urlKey = ($fw.data.get('cloud_environment') === 'dev') ? "development-url" : "live-url",
    url = self.hosts[urlKey];

    self.collection = new App.Collection.CMS([], { url : url });
    self.collection.fetch({ reset: true, success : function(){
      self.collection.bind('reset', $.proxy(self.render, self));
      return self.renderCMS();
      self.$el.removeClass('busy');
    }, error : function(err){
      console.log('Error fetching CMS data: ' + err.toString());
      self.renderErrorView();
      self.$el.removeClass('busy');
    }});
  },
  renderCMS : function(){
    var self = this;
    this.$el.empty();
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

    this.section = this.section || this.collection.at(0) && this.collection.at(0).get('_id');

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
    this.$fbContainer = $('<div class="fbContainer"></div>');
    this.$listFieldContainer = $('<div></div>'); // Contains subviews of FormBuilder for drilling down into editing list fields
    this.$auditContainer = $('<div></div>');
    this.$el.prepend(this.$fbContainer, this.$listFieldContainer, this.$auditContainer);

    var isAdministrator = $fw.userProps.roles.indexOf('cmsadmin'); //TODO: Wire this up - doesn't exist yet
    this.form = new App.View.CMSSection({ $el : this.$fbContainer, collection : this.collection, section : this.section, isAdministrator : true }); //

    this.form.render();

    this.form.bind('edit_field_list', $.proxy(this.onEditFieldList, this));
    this.form.bind('message', $.proxy(this.alertMessage, this));

    this.$left = $(this.templates.$cms_left());

    this.tree = new App.View.CMSTree({collection : this.collection, section : this.section});
    this.$el.prepend(this.$left);
    this.$el.find('.cmsTreeContainer').append(this.tree.render().$el);
    this.tree.bind('sectionchange', function(id){
      self.section = id;
      $.proxy(self.treeNodeClicked, self)(id);
      $.proxy(self.form.setSection, self.form)(id);
    });

    this.tree.bind('message', $.proxy(this.alertMessage, this));
    this.tree.bind('cms-checkUnsaved', $.proxy(this.checkUnsaved, this));

    return this;
  },
  renderEmptyCMSView : function(){
    this.message = new App.View.FullPageMessageView({ message : 'Your CMS contains no sections', button : 'New Section &raquo;', cb :$.proxy(this.onCreateSection, this)});

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
  onEditFieldList : function(options){
    var self = this;
    self.active = 'listfield';
    self.$fbContainer.hide();
    self.$listFieldContainer.empty().show();
    options.$el = self.$listFieldContainer;
    self.listfield = new App.View.CMSListField(options);
    self.listfield.render();
    self.listfield.bind('back', $.proxy(self.onCMSBack, self));
  },
  onCMSBack : function(success){
    var self = this;
    switch(this.active){
      case "listfield":
        self.$listFieldContainer.empty().hide();
        if (self.listfield){
          self.listfield.undelegateEvents();
        }
        if (success === true){
          // Show save success message
          self.alertMessage();
        }
        self.$fbContainer.show();
        self.form.renderListFieldTables();
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
  onCreateSection : function(){
    var self = this,
    createView = new App.View.CMSCreateSection({collection : this.collection, current : this.section});
    this.$el.append(createView.render().$el);
    createView.bind('message', $.proxy(this.alertMessage, this));
    createView.bind('sectionchange', function(section){
      self.section = section;
    });

  },
  "onDeleteSection": function (e) {
    var self = this,
    selected = this.tree.treenode.jstree('get_selected'),
    _id = selected.attr('id'),
    model = this.collection.findWhere({_id : _id}),
    modal;

    if (model.has('children') && model.get('children').length>0){
      modal = new App.View.Modal({
        title: 'Cannot Remove ' + model.get('name'),
        body: "Error removing " + model.get('name') + " - this section has child sections. Please delete all child sections and try again.",
        okText: 'Ok',
        cancelText : false
      });
    }else{
      modal = new App.View.Modal({
        title: 'Confirm Delete',
        body: "Are you sure you want to delete " + model.get('name') + "?",
        okText: 'Delete',
        cancelText : 'Cancel',
        ok: function (e) {
          self.collection.remove(model, {
            success : function(){
              // set current section as first tree node
              var first = self.tree.treenode.find('li:first').attr('id');
              self.section = first;
              $.proxy(self.form.setSection, self.form)(first);
              self.alertMessage('Section removed successfully');
            },
            error : function(){
              self.alertMessage('Error removing section', 'danger');
            }
          });
        }
      });
    }


    return self.$el.append(modal.render().$el);
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
    tree = (this.tree) ? this.tree.$el : this.$el,
    unsaved = tree.find('.jstree-unsaved');
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
    this.$el.find('.btn-cancel-changes').attr('disabled', false);
    $(this.options.container).find('.fh-box-header .btn-cms-publish').attr('disabled', false);
    this.$el.find('.btn-cms-publish').attr('disabled', false);

  },
  onDiscardDraft : function(){
    // including .cmsTreeContainer here important, otherwise we pick up on the legend
    if (this.tree.$el.find('.cmsTreeContainer .jstree-draft').length===0){
      this.$el.find('.btn-cancel-changes').attr('disabled', true);
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
  },
  alertMessage : function(msg, cls, cb){
    cls = cls || 'success';
    msg = msg || 'Save successful';

    var cms_alert = Handlebars.compile($('#cms_alert').html()),
    alertBox = $(cms_alert({ cls : cls, msg : msg }));


    // Issues occuring with messages appending to previous instances of this.$el
    // - lookup in global context after some delay to ensure correct div selected
    setTimeout(function(){
      var el = $('#cms_container .fbContainer .middle');
      $(el).prepend(alertBox);
    }, 200);


    // Fade out then remove our message
    setTimeout(function(){
      alertBox.fadeOut('fast', function(){
        if (typeof cb === 'function'){
          cb();
        }
        alertBox.remove();
      });
    }, 3000);
  },
  checkIsEnabled : function(){
    var inst = $fw.data.get('inst'),
    enabled = inst.config && inst.config.app && inst.config.app.cms && inst.config.app.cms.enabled || "false";
    this.guid = inst.guid;
    if (enabled!=="true" && enabled!== true){
      return false;
    }
    return true;

  }
});
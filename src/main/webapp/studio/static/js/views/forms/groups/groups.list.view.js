var App = App || {};
App.View = App.View || {};

App.View.FormGroupsList = App.View.FormListBase.extend({
  templates : {
    'formsListBaseAdd' : '#formsListBaseAdd',
    'fullpageLoading' : '#fullpageLoading',
    'formGroupEdit' : '#formGroupEdit'
  },
  events : {
    'click tr' : 'onRowSelected',
    'click .btn-add-group' : 'onCreate',
    'click .btn-save-group' : 'onSaveGroup',
    'click .btn-delete-group' : 'onDeleteGroup'

  },
  initialize: function(){
    var self = this;
    this.collection = new App.Collection.FormGroups();
    this.pluralTitle = 'Groups';
    this.singleTitle = 'Group';
    this.columns = [{
      "sTitle": 'Name',
      "mDataProp": this.CONSTANTS.GROUPS.NAME
    },{
      "sTitle": 'Users',
      "mDataProp": function(group){
        if (group.users && group.users.length){
          return group.users.length;
        }
        return 0;
      }
    },{
      "sTitle": 'Forms',
      "mDataProp": function(group){
        if (group.forms && group.forms.length){
          return group.forms.length;
        }
        return 0;
      }
    },{
      "sTitle": 'Themes',
      "mDataProp": function(group){
        if (group.themes && group.themes.length){
          return group.themes.length;
        }
        return 0;
      }
    }
    ];

    this.forms =  new App.Collection.Form();
    this.users = new App.Collection.Users();
    this.themes = new App.Collection.FormThemes();
    this.apps = new App.Collection.FormApps();

    async.parallel([
      function(cb){
        self.forms.fetch({
          reset : true,
          success : function(res){
            return cb(null, res);
          },
          error : function(){
            console.log(arguments);
            return cb("Error retrieving forms");
          }
        });
      },
      function(cb){
        self.users.fetch({
          reset : true,
          success : function(res){
            return cb(null, res);
          },
          error : function(){
            console.log(arguments);
            return cb("Error retrieving users");
          }
        });
      },
      function(cb){
        self.themes.fetch({
          reset : true,
          success : function(res){
            return cb(null, res);
          },
          error : function(){
            console.log(arguments);
            return cb("Error retrieving themes");
          }
        });
      },
      function(cb){
        self.apps.fetch({
          reset : true,
          success : function(res){
            return cb(null, res);
          },
          error : function(){
            console.log(arguments);
            return cb("Error retrieving apps");
          }
        });
      }
    ], function(err, res){
      if (err){
        return;
      }
      self.postLoaded = true;
      self.render();
    });
    self.constructor.__super__.initialize.apply(self, arguments);
  },
  render : function(){
    var self = this;
    if (self.postLoaded === true){
      self.loaded = true;
    }else{
      self.loaded = false;
    }
    App.View.FormListBase.prototype.render.apply(this, arguments);
    return this.renderPreview();
  },
  renderPreview : function(){
    this.$previewEl = $('<div class="grouppreview" />');
    this.$el.append(this.$previewEl);
    this.$previewEl.hide();

    this.$previewEl.append('<div id="groupPreviewContainer"></div>');


    // Move the loading to the bottom of this element's dom
    this.loading.remove();
    this.$el.append(this.loading);
    return this;
  },
  updatePreview : function(updatedModel){
    console.log("updatePreview",updatedModel);
    var self = this,
    usersIds = updatedModel.get('users'),
    formsIds = updatedModel.get('forms'),
    themesIds = updatedModel.get('themes'),
    appsIds = updatedModel.get('apps'),
    groupObject = {
      name : updatedModel.get('name'),
      users : this.users.toJSON(),
      forms : this.forms.toJSON(),
      themes : this.themes.toJSON(),
      apps : this.apps.toJSON()
    }, tpl;

    tpl = $(this.templates.$formGroupEdit(groupObject));
    this.$previewEl.find('#groupPreviewContainer').html(tpl);
    tpl.find('select').select2();
    tpl.find('#formGroupUsers').select2('val', usersIds);
    tpl.find('#formGroupForms').select2('val', formsIds);
    tpl.find('#formGroupThemes').select2('val', themesIds);
    tpl.find('#formGroupApps').select2('val', appsIds);

    if (this._id && typeof this._id==='string'){
      tpl.find('h4.title').html('Edit Group: ' + groupObject.name);
    }else{
      tpl.find('h4.title').html('Create New Group');
    }

    self.$previewEl.show();
    this.selectMessage.$el.hide();
  },
  onSaveGroup : function(){
    var self = this,
    form = this.$el.find('form.formsGroups'),
    updatedGroup = {
      name : form.find('input[name=name]').val(),
      forms : form.find('select#formGroupForms').val(),
      users : form.find('select#formGroupUsers').val(),
      themes : form.find('select#formGroupThemes').val(),
      apps : form.find('select#formGroupApps').val()
    },
    model;

    if (this._id && typeof this._id==='string'){
      model = this.collection.findWhere({_id : this._id});
      updatedGroup._id = this._id;
    }else{
      model = new App.Model.FormGroup();
    }

    model.save(updatedGroup, {
      type: 'post',
      success : function(){
        if (typeof updatedGroup._id === 'undefined'){
          self.collection.add(model, {silent : true}); // supress any request or reset event
        }

        self.message('Group updated successfully');
        self.collection.trigger('reset');
        self.$previewEl.hide();
        self.selectMessage.$el.show();


      },
      error: function(){
        self.message('Error updating group', 'danger');
      }
    });
  },
  onCreate : function(){
    var model = new App.Model.FormGroup({
      users : [],
      groups : [],
      themes : [],
      apps : [],
      name : ''
    });
    // Deselect all table rows
    this._id = undefined;
    this.$el.find('tr.info').removeClass('info');

    this.updatePreview(model);
  },
  onDeleteGroup : function(){
    var self = this,
    model = this.collection.findWhere({_id : this._id}),
    modal = new App.View.Modal({
      title: 'Confirm Delete',
      body: "Are you sure you want to delete " + model.get('name') + "?",
      okText: 'Delete',
      cancelText : 'Cancel',
      ok: function (e) {
        model.destroy({
          success : function(){
            self.message('Group deleted successfully');
            self.$previewEl.hide();
            self.selectMessage.$el.show();
          }, error : function(){
            self.message('Error deleting group', 'danger');
          }
        });
      }
    });
    this.$el.append(modal.render().$el);
  }
});
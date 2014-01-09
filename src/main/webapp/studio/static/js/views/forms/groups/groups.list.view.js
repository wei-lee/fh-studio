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
    'click .btn-save-group' : 'onSaveGroup'

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
      "sTitle": 'Description',
      "mDataProp": this.CONSTANTS.GROUPS.DESC
    }];

    this.forms =  new App.Collection.Form();
    this.users = new App.Collection.Users();
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
      }
    ], function(err, res){
      self.loaded = true;
    });
    self.constructor.__super__.initialize.apply(self, arguments);
  },
  render : function(){
    var self = this;
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
    groupObject = {
      name : updatedModel.get('name'),
      users : this.users.toJSON(),
      forms : this.forms.toJSON()
    }, tpl;

    tpl = $(this.templates.$formGroupEdit(groupObject));
    this.$previewEl.find('#groupPreviewContainer').html(tpl);
    tpl.find('select').select2();
    tpl.find('#formGroupUsers').select2('val', usersIds);
    tpl.find('#formGroupForms').select2('val', formsIds);

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
    },
    model;

    if (this._id && typeof this._id==='string'){
      model = this.collection.findWhere({_id : this._id});
      updatedGroup._id = this._id;
    }else{
      model = new App.Model.FormGroup();
    }

    model.save(updatedGroup, {
      success : function(){
        self.message('Group updated successfully');
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
      name : ''
    });
    // Deselect all table rows
    this._id = undefined;
    this.$el.find('tr.info').removeClass('info');

    this.updatePreview(model);
  }
});
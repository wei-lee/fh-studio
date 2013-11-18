var App = App || {};
App.View = App.View || {};

App.View.ThemeList = App.View.Forms.extend({
  templates : {
    'formsAddForm' : '#formsAddForm',
    'formsListMenu' : '#formsListMenu',
    'fullpageLoading' : '#fullpageLoading'
  },
  events : {
    'click .btn-add-form' : 'onCreateForm',
    'click tr' : 'onFormSelected',
    'click .btn-clone-form' : 'onCloneForm',
    'click .btn-delete-form' : 'onDeleteForm'
  },
  initialize: function(){
    var self = this;
    this.constructor.__super__.initialize.apply(this, arguments);
    this.collection = new App.Collection.Form();

    this.loaded = false;
    this.collection.fetch({ reset : true, success : function(){
      self.loaded = true;
      self.collection.bind('reset', $.proxy(self.render, self));
      self.collection.trigger('reset');
    }});
  },
  render : function(){
    this.breadcrumb(['Forms', 'Forms List']);
    this.$el.empty();
    this.$el.addClass('span10 formslist busy');

    this.loading = $(this.templates.$fullpageLoading());
    this.$el.append(this.loading);

    if (this.loaded){
      this.$el.removeClass('busy');
      if (this.collection.length>0){
        this.renderList();
      }else{
        this.renderEmptyView();
      }
    }
    return this;
  },
  renderEmptyView : function(){
    this.message = new App.View.FullPageMessageView({ message : 'No forms found', button : 'Create Form', cb :$.proxy(this.onCreateForm, this)});

    this.$el.append(this.message.render().$el);
    return this;
  },
  renderList : function(){
    this.$el.append(this.templates.$formsAddForm());
    var self = this,
    //Needed fields eventually: Name, Version, Last Updated, Apps using, Submissions, Submissions Total
    columns = [{
      "sTitle": 'Name',
      "mDataProp": this.CONSTANTS.FORM.NAME
    },{
      "sTitle": 'Description',
      "mDataProp": this.CONSTANTS.FORM.DESC,
      "sWidth" : "275px"
    },{
      "sTitle": 'Updated',
      "mDataProp": this.CONSTANTS.FORM.UPDATED
    },{ //TODO: Make these..?
     "sTitle": 'Apps Using This',
     "mDataProp": this.CONSTANTS.FORM.USING
    },{
     "sTitle": 'Submissions today',
     "mDataProp": this.CONSTANTS.FORM.SUBSTODAY
    },{
     "sTitle": 'Submissions',
     "mDataProp": this.CONSTANTS.FORM.SUBS
    }],
    forms = this.collection.toJSON(),
    formsListMenu = $(this.templates.$formsListMenu());

    this.table = new App.View.DataTable({
      aaData : forms,
      "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
        $(nTr).attr('data-index', iRow).attr('data-hash', sData.Hash);
      },
      "aaSorting" : [],
      "aoColumns": columns,
      "bAutoWidth": false,
      "sPaginationType": 'bootstrap',
      "sDom": "<'row-fluid'<'span4'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>",
      "bLengthChange": false,
      "iDisplayLength": 5,
      "bInfo": true,
      "oLanguage" : {
        "sEmptyTable" : "No forms found"
      }
    });
    this.table.render();
    this.table.$el.find('table').removeClass('table-striped');
    this.$el.append(this.table.$el);
    
    this.$el.append('<br />');

    // Add in the view form view
    this.selectMessage = new App.View.FullPageMessageView({ message : 'Select a form above to preview & manage', button : false });
    this.$el.append(this.selectMessage.render().$el);

    this.$fbEl = $('<div class="formpreview" />');
    this.$el.append(this.$fbEl);
    this.$fbEl.hide();

    this.fb = new Formbuilder(this.$fbEl, {
      noScroll : true,
      noEditOnDrop : true,
      bootstrapData: [],
      editStructure : false
      //TODO: editValues : false mode..
    });

    // Place holders that get filled when the user clicks a form
    this.$fbEl.find('.middle').prepend("<p>Form Description</p>");
    this.$fbEl.find('.middle').prepend("<h4>Form Title</h4>");

    this.$fbEl.find('.middle').removeClass('span6').addClass('span9 well');
    this.$fbEl.find('.right').removeClass('span4').addClass('span2');

    this.$fbEl.find('.right').html(formsListMenu);

    // Move the loading to the bottom of this element's dom
    this.loading.remove();
    this.$el.append(this.loading);
  },
  onCreateForm : function(e){
    e.preventDefault();
    var self = this,
    createView = new App.View.FormCreateClone({ collection : this.collection, mode : 'create' });
    this.$el.append(createView.render().$el);
    createView.bind('message', function(){}); // TODO - do we want messages up top like with CMS?
  },
  onFormSelected : function(e){
    var self = this,
    el = e.target,
    nodeName = el.nodeName.toLowerCase();
    if (nodeName === 'th'){
      return;
    }
    el = (nodeName==="tr") ? $(el) : $($(el).parents('tr'));
    this.$el.find('tr').removeClass('info');

    el.addClass('info');

    var index = el.data('index'),
    form = this.collection.at(index);

    this.$el.addClass('busy');
    this.$fbEl.hide();
    this.selectMessage.$el.hide();

    // Fetch the full form definition from the serverside
    form.fetch({
      success : function(){
        self.$el.removeClass('busy');
        // Give the animation some time to finish
        setTimeout(function(){
          var fields = self.formToFormBuilderFields(form);

          self.currentForm = index;

          self.$fbEl.find('h4').html(form.get('Name'));
          self.$fbEl.find('p').html(form.get('Description'));


          self.$fbEl.show();
          self.fb.mainView.collection.reset(fields);
        }, 500);
      },
      error : function(){
        //TODO
      }
    });
  },
  onCloneForm : function(e){
    e.preventDefault();
    var self = this,
    form = this.collection.at(this.currentForm),
    createView = new App.View.FormCreateClone({ collection : this.collection, mode : 'clone', form : form.toJSON() });
    this.$el.append(createView.render().$el);
    createView.bind('message', function(){}); // TODO - do we want messages up top like with CMS?
  },
  onDeleteForm : function(){
    var self = this,
    form = this.collection.at(this.currentForm);
    var modal = new App.View.Modal({
      title: 'Confirm Delete',
      body: "Are you sure you want to delete form " + form.get('Name') + "?",
      okText: 'Delete',
      cancelText : 'Cancel',
      ok: function (e) {
        self.collection.remove(form, {
          success : function(){

          },
          error : function(){

          }
        });
      }
    });
    this.$el.append(modal.render().$el);
  }
});
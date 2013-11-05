var App = App || {};
App.View = App.View || {};

App.View.FormList = App.View.Forms.extend({
  templates : {
    'formsAddForm' : '#formsAddForm'
  },
  events : {
    'click .btn-add-form' : 'onCreateForm',
    'click tr' : 'onFormSelected'
  },
  initialize: function(){
    this.compileTemplates();
    this.collection = new App.Collection.Form();
    this.collection.bind('reset', $.proxy(this.render, this));
    this.collection.fetch({ reset : true });

  },
  render : function(){
    this.$el.empty();
    this.$el.addClass('span10 formslist');

    if (this.collection.length>0){
      this.renderList();
    }else{
      this.renderEmptyView();
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
      "mDataProp": 'Name'
    },{
      "sTitle": 'Description',
      "mDataProp": 'Description'
    },{
      "sTitle": 'Updated',
      "mDataProp": 'DateUpdated'
    }],
    forms = this.collection.toJSON();

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
      bootstrapData: [{"hash" : "1a2b3c4d", "_id" : "123", "label":"Please enter your clearance number","field_type":"text","required":true,"field_options":{},"cid":"c6"}],
      editStructure : false
      //TODO: editValues : false mode..
    });

    // Place holders that get filled when the user clicks a form
    this.$fbEl.prepend("<p>Form Description</p>");
    this.$fbEl.prepend("<h4>Form Title</h4>");

    this.$fbEl.find('.middle').removeClass('span6');
    this.$fbEl.find('.right').hide();

  },
  onCreateForm : function(e){
    e.preventDefault();
    alert('create');
  },
  onFormSelected : function(e){
    var el = e.target;
    el = (el.nodeName.toLowerCase==="tr") ? $(el) : $($(el).parents('tr'));
    this.$el.find('tr').removeClass('info');

    el.addClass('info');

    var index = el.data('index'),
    form = this.collection.at(index),
    fields = this.formToFormBuilderFields(form.toJSON());

    this.$fbEl.find('h4').html(form.get('Name'));
    this.$fbEl.find('p').html(form.get('Description'));

    this.selectMessage.$el.hide();
    this.$fbEl.show();
    this.fb.mainView.collection.reset(fields);
  }
});
var App = App || {};
App.View = App.View || {};

App.View.FormList = App.View.Forms.extend({
  templates : {
    'formsListMenu' : '#formsListMenu'
  },
  events : {
    'click .btn-add-form' : 'onCreateForm'
  },
  initialize: function(){
    this.compileTemplates();
    this.collection = new App.Collection.Form();
    this.collection.bind('reset', $.proxy(this.render, this));
    this.collection.fetch({ reset : true });

  },
  render : function(){
    this.$el.empty();
    this.$el.addClass('span10');

    this.$el.append(this.templates.$formsListMenu());

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
    var self = this,
    //Needed fields eventually: Name, Version, Last Updated, Apps using, Submissions, Submissions Total
    columns = [{
      "sTitle": 'Name',
      "mDataProp": 'data.Name'
    },{
      "sTitle": 'Description',
      "mDataProp": 'data.Description'
    },{
      "sTitle": 'Updated',
      "mDataProp": 'data.DateUpdated'
    }],
    forms = this.collection.toJSON();

    this.table = new App.View.DataTable({
      aaData : forms,
      "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
        $(nTr).attr('data-index', iRow).attr('data-hash', 'hash');
      },
      "aaSorting" : [],
      "aoColumns": columns,
      "bAutoWidth": false,
      "sPaginationType": 'bootstrap',
      "sDom": "<'row-fluid'<'span4'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>",
      "bLengthChange": false,
      "iDisplayLength": 5,
      "bInfo": true,
      "bFilter": false,
      "oLanguage" : {
        "sEmptyTable" : "No forms found"
      }
    });
    this.$el.append(this.table.render().$el);

    // Add in the view form view
    var selectMessage = new App.View.FullPageMessageView({ message : 'Select a form above to preview & manage', button : false });
    this.$el.append(selectMessage.render().$el);

  },
  onCreateForm : function(e){
    e.preventDefault();
    alert('create');

  }
});
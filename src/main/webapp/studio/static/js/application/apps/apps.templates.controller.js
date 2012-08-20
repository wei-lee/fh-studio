var Apps = Apps || {};

Apps.Templates = Apps.Templates || {};

Apps.Templates.Controller = Controller.extend({

  model: {
    template: new model.Template()
  },

  views: {
    templates_grid_wrapper: "#templates_grid_wrapper",
    templates_grid: "#templates_grid"
  },

  container: null,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function () {
    $fw.client.lang.insertLangForContainer($('#template_message'));
    this.bindCloneButtons();
  },

  show: function() {
    this._super();

    this.initFn();
    
    var self = this;
    console.log('templates show');

    this.model.template.list(function(res) {
      var data = self.addControls(res);
      self.renderAppListing(data);
    }, function() {
      // Failure
    }, true);
  },

  bindCloneButtons: function () {
    $('.template_clone_button').text($fw.client.lang.getLangString('template_clone_button')).unbind().bind('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $fw.client.tab.apps.manageapps.getController('apps.clone.controller').show($fw.data.get('inst').guid);
    });
  },
  
  doView: function (guid) {
    console.log('template.doView');
    $fw.data.set('template_mode', true);
    //$fw.client.app.doShowManage(guid);
    $fw.client.tab.apps.manageapps.show(guid);
  },
  
  /*
   * Hide any component or button that isn't relevant to templates,
   * and unbind/block anything that can't be hidden and isn't relevant to templates
   */
  applyPreRestrictions: function () {
    console.log('applying template restrictions');
    $('.template-restriction').hide();
  },
  
  applyPostRestrictions: function () {
    // show the template app message
    $('#template_message').show();
  },
  
  /*
   * Exact opposite of applyPreRestrictions
   */
  removePreRestrictions: function () {
    console.log('removing template restrictions');
    $('.template-restriction').show();
  },
  
  removePostRestrictions: function () {
    // hide the template app message
    $('#template_message').hide();

  },

  renderAppListing: function(data) {
    var self = this;

    this.user_table = $('#templates_grid').show().dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns,
      "fnRowCallback": function(nRow, aData, iDisplayIndex) {
        self.rowRender(nRow, aData);
      }
    });
  },

  rowRender: function(row, data) {
    var self = this;
    var icon_cell = $('td:first', row);

    // Render icons (can be called multiple times, e.g. after sorting)
    if ( $('img', icon_cell).length === 0 ) {
      icon_cell.addClass('app_icon_cell');
      var icon_path = icon_cell.text().trim();
      var icon = $('<img>').attr('src', icon_path).addClass('app_icon');
      icon_cell.empty().append(icon);
      var guid = data[4];
      // Bind row clicks to show Manage an app
      $('td:eq(1)', row).addClass('app_title').unbind().click(function(){
        // GUID is last, TODO: Make this better

        self.doView(guid);
      });

    }
  },

  addControls: function(res) {
    // Add control column
    res.aoColumns.push({
      sTitle: "Controls",
      "bSortable": false,
      "sClass": "controls"
    });

    $.each(res.aaData, function(i, row) {
      var controls = [];
      // TODO: Move to clonable hidden_template
      controls.push('<button class="btn edit_app" >Edit</button>&nbsp;');
      row.push(controls.join(""));
    });

    return res;
  }

 });
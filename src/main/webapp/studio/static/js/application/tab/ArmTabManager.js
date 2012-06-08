application.ArmTabManager = Class.extend({
  
  arm_layouts: {},
  event: null,
  ui: null,
  
  init: function(){
    this.arm_layouts.arm = new application.ArmLayout();
    this.arm_layouts.armusers = new application.ArmUsersLayout();
    this.arm_layouts.armgroups = new application.ArmGroupsLayout();
    this.arm_layouts.armdevices = new application.ArmDevicesLayout();
  },
  
  show: function(event, ui){
    this.event = event;
    this.ui = ui;
    var current_layout = $fw_manager.state.get('arm_layout', 'selected', 'arm');
    this.showLayout(current_layout);
  },
  
  showLayout: function(layout_name){
    $fw_manager.state.set('arm_layout', 'selected', layout_name);
    $('.arm-layout').hide();
    var layout = $('#' + layout_name + '_layout');
    layout.show();
    this.arm_layouts[layout_name].show(this.event, {index: this.ui.index, tab: this.ui.tab, panel: layout}); //important to use the layout as the panel object
  }
});
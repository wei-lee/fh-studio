var Reporting = Reporting || {};
Reporting.Tab = Reporting.Tab || {};

Reporting.Tab.Manager = Tab.Manager.extend({
  
  id: 'reporting_layout',
  
  init: function() {
    this._super();
    this.initFn = _.once(this.initBindings);
  }
});
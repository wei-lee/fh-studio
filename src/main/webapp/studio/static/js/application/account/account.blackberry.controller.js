var Account = Account || {};

Account.Blackberry = Account.Blackberry || {};

Account.Blackberry.Controller = Account.Resource.Support.extend({
  destination: 'blackberry',

  views: {
    destinations_blackberry_container: '#destinations_blackberry_container'
  },

  container: null,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function () {
    var self = this;

    $fw.client.lang.insertLangForContainer($(this.views.destinations_blackberry_container));
  },

  show: function(){
    this._super();

    this.initFn();

    this.setupDestination();

    this.container = this.views.destinations_blackberry_container;
    $(this.container).show();
  },
  
  checkResources: function() {
    var that = this;
    var dest = that.destination;
    $.post(Constants.LIST_RESOURCES_URL, {
      dest: dest
    }, function (result) {
      console.log('list resources response > ' + JSON.stringify(result));
      
      // Combine the resources in the result to a single array and set the type of them accordingly
      var resources = [];
      var csk = result.csk;
      for (var ci=0; ci<csk.length; ci++) {
        var temp_csk = csk[ci];
        resources.push({type: 'csk', guid: temp_csk.guid});
      }
      var db = result.db;
      for (var ki=0; ki<db.length; ki++) {
        var temp_db = db[ki];
        resources.push({type: 'db', guid: temp_db.guid});
      }
      $('#profile_view_container').hide();
      if (resources.length > 0) {
        // have at least one resource, so show the dashboard
        that.showResources(resources);
      }
      else {
        // no resources uploaded yet, show get started
        that.showGetStarted();
      }
      
    });
  },
  
  /*
   * Bind any custom callbacks for steps or buttons in steps, based on the destination
   */
  bindGetStartedWizardSteps: function (wizard) {
    var that = this;
    console.log('binding get started steps for android');
    
    wizard.validate({
      rules: {
        blackberry_csk_upload_file: 'required',
        blackberry_db_upload_file: 'required'
      }
    });
    
    wizard.find('#blackberry_csk_finish').bind('show', function () {
      var step = $(this);
      console.log('uploading csk file');
      
      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog.append(step, 'Starting Upload');
      
      var file_input_id = that.destination + '_csk_upload_file';
      var upload_url = Constants.UPLOAD_RESOURCE_URL;
      var data = {
        dest: "blackberry",
        resourceType: 'csk',
        buildType: 'release'
      };
      console.log("params: " + JSON.stringify(data));
      
      that.models.resource.startUpload(wizard.find('#'+file_input_id), upload_url, data, function (result) {
        console.log('upload result > ' + JSON.stringify(result));
        if ('undefined' !== typeof result.error && result.error.length > 0) {  
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_failed'));
          proto.Wizard.previousStep(wizard, result.error);
        }   
        else {          
          proto.ProgressDialog.setProgress(step, 100);
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_complete'));
          proto.Wizard.jumpToStep(wizard, 3);
        }
      }, true, function(xhr, err){
        var error = $fw.client.lang.getLangString('file_upload_error');
        proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_failed'));
        proto.Wizard.previousStep(wizard, error);
      });
    });
    
    wizard.find('#blackberry_db_finish').bind('show', function () {
      console.log('uploading db file');
      var step = $(this);
      
      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog.append(step, 'Starting Upload');
      
      var file_input_id = that.destination + '_db_upload_file';
      var upload_url = Constants.UPLOAD_RESOURCE_URL;
      var data = {
        dest: "blackberry",
        resourceType: 'db',
        buildType: 'release'
      };
      console.log("params: " + JSON.stringify(data));
      
      that.models.resource.startUpload(wizard.find('#'+file_input_id), upload_url, data, function (result) {
        console.log('upload result > ' + JSON.stringify(result));
        if ('undefined' !== typeof result.error && result.error.length > 0) {  
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_failed'));
          proto.Wizard.previousStep(wizard, result.error);
        }   
        else { 
          proto.ProgressDialog.setProgress(step, 100);
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_complete'));
            
          wizard.find('.jw-button-finish').trigger('click');     
          
          that.setupDestination();   
        }
      }, true, function(xhr, err){
        var error = $fw.client.lang.getLangString('file_upload_error');
        proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_failed'));
        proto.Wizard.previousStep(wizard, error);
      });
    });
  }
});
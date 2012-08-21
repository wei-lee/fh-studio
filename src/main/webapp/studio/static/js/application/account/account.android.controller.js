var Account = Account || {};

Account.Android = Account.Android || {};

Account.Android.Controller = Account.Resource.Support.extend({
  destination: 'android',

  views: {
    destinations_android_container: '#destinations_android_container'
  },

  container: null,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function () {
    var self = this;

    $fw.client.lang.insertLangForContainer($(this.views.destinations_android_container));
  },

  show: function(){
    this._super();

    this.initFn();

    this.setupDestination();

    this.container = this.views.destinations_android_container;
    $(this.container).show();
  },
  
  /*
   * Bind any custom callbacks for steps or buttons in steps, based on the destination
   */
  bindGetStartedWizardSteps: function (wizard) {
    var that = this;
    console.log('binding get started steps for android');
    
    wizard.validate({
      rules: {
        key_password: 'required'
      }
    });
    
    // automatically generate key & cert when this step is shown
    wizard.find('#android_getstarted_generate').bind('show', function () {
      console.log('generating android key & cert');
      var step = $(this);
      var resources = that.getResources();
      var password = wizard.find('#android_key_password').val();
      
      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog.append(step, 'Starting Generation');
      
      var params = {
        dest: 'android',
        type: 'certificate',
        password: password
      };
      that.models.resource.generateCert(params, 
        function (result) {
          proto.ProgressDialog.setProgress(step, 100);
          proto.ProgressDialog.append(step, 'Generation Complete');     
          
          // TODO: better way for this temporary workaround for finishing wizard after successful upload  
          wizard.find('.jw-button-finish').trigger('click');
          
          // set key and cert flags, and move to next step
          resources.private_key = true;
          // TODO: is this the right key to set to true for the android dist cert?
          resources.certificate = true;
          that.setResources(resources);
          that.setupDestination();
        },
        function (result) {
          proto.ProgressDialog.append(step, 'Generate Failed');
          // go back a step and show error
          proto.Wizard.previousStep(wizard, result.error);
        }
      );
    });
    
    wizard.find('#android_getstarted_finish').bind('show', function () {
      // TODO: better way for this temporary workaround for finishing wizard after successful upload  
      wizard.find('.jw-button-finish').trigger('click');
      
      var resources = that.getResources();
      
      console.log('android getstarted wizard finished');
      if (resources.private_key) {
        console.log('have a private key, lets go back to the dashboard');
        that.setupDestination();
      }
      else {
        console.log('dont have a key yet, lets show the upload key wizard');
        that.showResourceWizard('private_key');
      }
    });
  }
});
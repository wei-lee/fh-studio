var Account = Account || {};

Account.Apple = Account.Apple || {};

Account.Apple.Controller = Account.Resource.Support.extend({
  destination: 'apple',

  views: {
    destinations_apple_container: '#destinations_apple_container',
    apple_getstarted: '#apple_getstarted',
    apple_resources: '#apple_resources',
    apple_getstarted_wizard: '#apple_getstarted_wizard',
    apple_key_wizard: '#apple_key_wizard',
    apple_cert_wizard: '#apple_cert_wizard'
  },

  container: null,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function () {
    var self = this;

    $fw.client.lang.insertLangForContainer($(this.views.destinations_apple_container));
  },

  show: function(){
    this._super();

    this.initFn();

    this.setupDestination();

    this.container = this.views.destinations_apple_container;
    $(this.views.destinations_apple_container).show();
  },
  
  /*
   * Bind any custom callbacks for steps or buttons in steps, based on the destination
   */
  bindGetStartedWizardSteps: function (wizard) {
    var that = this;
    console.log('binding get started steps for apple');

    wizard.validate({
      rules: {
        key_password: 'required',
        apple_csr_downloaded: 'downloaded'
      }
    });
    
    wizard.find('#apple_getstarted_csr_download').bind('click', function (e) {
      e.preventDefault();
      if (wizard.find('#apple_key_password').val().length > 0) {
        var resources = that.getResources();
        var url = Constants.GENERATE_CSR_URL + "&password=" + wizard.find('#apple_key_password').val();
        document.location = url;
        resources.private_key = true;
        that.setResources(resources);
        wizard.find('#apple_csr_downloaded').attr('value', 'downloaded');
        wizard.valid();
      }
      else {
        wizard.valid();
      }
    });
    wizard.find('#apple_getstarted_finish').bind('show', function () {
      console.log('apple getstarted wizard finished');
      
      // TODO: better way for this temporary workaround for finishing wizard after successful upload  
      wizard.find('.jw-button-finish').trigger('click');
      
      var resources = that.getResources();
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
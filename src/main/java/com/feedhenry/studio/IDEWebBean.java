package com.feedhenry.studio;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;

public class IDEWebBean{
  
  // studio props endpoint
  private static final String PROPS_ENDPOINT = "/box/srv/1.1/ide/<domain>/props/list";
  
  

  public static final String ALREADY_ACTIVATED = "already-activated";
  public static final String NO_SUCH_ACTIVATION = "no-such-activation";
  
  public static final String DEFAULT_URL = "/studio/";
  public static final String IDE_LOGIN = "login";
  public static final String IDE_LANDING = "landing";
  public static final String IDE_INDEX = "index";
  public static final String IDE_RESET = "reset";
  public static final String IDE_ACTIVATE = "activate";
  public static final String IDE_DEFAULT_FILE = "/%file%";
  public static final String IDE_THEMES_FILE = "/themes/%theme%/%file%";

  public static final String STUDIO_PAGES_GROUP_COOKIE = "feedhenry-studio-pages-group";
  public static final String LOGIN = "studio.login";
  public static final String LOGIN_PAGES = "studio.login.pages";
  public static final String AUTH_LANDING = "studio.landing.auth";
  public static final String NOAUTH_LANDING = "studio.landing.noauth";
  public static final String AUTH_LANDING_PAGES = "studio.landing.auth.pages";
  public static final String NOAUTH_LANDING_PAGES = "studio.landing.noauth.pages";

  public static final String[] GROUP_REPORTING = new String[] { "analytics" };
  public static final String[] GROUP_ARM = new String[] { "portaladmin" };
  public static final String[] GROUP_DEVELOPER = new String[] { "dev", "devadmin" };

  public static final String THEME_DEFAULT = "default";
  public static final String THEME_ENTERPRISE = "enterprise";
  
  public static final Log log = LogFactory.getLog("IDEWebBean");

  // public static final String PROTOCOL_PROPERTY = PropertyConstants.STUDIO_NAMESPACE + PropertyConstants.PROTOCOL;

  public static final List<String> mAllowedActionRequest = new ArrayList<String>();

  static {
    mAllowedActionRequest.add(IDE_LOGIN);
    mAllowedActionRequest.add(IDE_LANDING);
    mAllowedActionRequest.add(IDE_INDEX);
  }
  private ServletContext mServletContext;
  private JSONObject mInput;
  private String mDomain = null;
  private List<String> mGroups;
  private boolean mLoggedIn = false;
  private String mTheme = null;
  private JSONObject mStudioProps = null;
  private JSONObject mServerProps = null;
  private JSONObject mMillicoreProps = null;
  private JSONObject mUC = null;

  public void init(ServletContext pServletContext) throws Exception {
    mServletContext = pServletContext;
    System.out.println("IDEWebBean.init()");
  }

  public boolean initreq(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageName) throws Exception {
    String redirectUrl = null;
    boolean proceed = true;

    // Allow mDomain to be forwarded with request
    if (null != pRequest.getAttribute("Domain")) {
      mDomain = (String) pRequest.getAttribute("Domain");
    }

    // Allow mStudioProps to be forwarded with request 
    if( null != pRequest.getAttribute("StudioProps") ) {
      mStudioProps = (JSONObject) pRequest.getAttribute("StudioProps");
    }

    // Allow mTheme to be forwarded with request
    if (null != pRequest.getAttribute("Theme")) {
      mTheme = (String) pRequest.getAttribute("Theme");
    }
    
    // Allow for domain being passed in request
    if( null == mDomain ) {
      // call studio props endpoint to get all properties
      HttpClient client = new DefaultHttpClient();
      HttpPost post = new HttpPost("http://127.0.0.1" + PROPS_ENDPOINT.replace("<domain>", "apps"));
      StringEntity entity = new StringEntity("{\"domain\":\"apps\"}");
      post.setEntity(entity);
      
      HttpResponse response = client.execute(post);
      HttpEntity resEntity = response.getEntity();
      if (resEntity != null) {
        InputStreamReader iSR = new InputStreamReader(resEntity.getContent());
        BufferedReader br = new BufferedReader(iSR);
        StringBuilder sb = new StringBuilder();
        String read = br.readLine();
        try {
          while(read != null) {
            sb.append(read);
            read = br.readLine();
          }
          mMillicoreProps = JSONObject.fromObject(sb.toString());
          mStudioProps = mMillicoreProps.getJSONObject("clientProps");
          mServerProps = JSONObject.fromObject("{\"domain\":\"apps\",\"props\":{\"account.registration.free\":\"true\",\"api.act.connection.secure\":\"true\",\"apikeys.api.salt\":\"apikeys-api-salt\",\"apikeys.enabled\":\"true\",\"apikeys.secret.salt\":\"apikeys-secret-salt\",\"appnaming.server\":\"http://127.0.0.1:8080\",\"auth.cf.key\":\"Gb7cGxk2H9uTqi65vVCXcw==\",\"auth.cf.proxyurl\":\"http://192.168.28.124:8000\",\"auth.cf.url\":\"https://api.cloudfoundry.com\",\"auth.type\":\"local\",\"aws.access.key\":\"\",\"aws.access.secret\":\"\",\"aws.s3.region\":\"EU\",\"block.usecache\":\"false\",\"browser.cacheExpires\":\"0\",\"cache.client\":\"whalin\",\"cache.connection.timeout\":\"5555\",\"cache.enabled\":\"true\",\"cache.fail.on.timeout\":\"false\",\"cache.keep.seconds\":\"259200\",\"cache.keep.seconds.apps.default\":\"3600\",\"cache.list.criteria.hash\":\"true\",\"cache.max.get.timeout\":\"5000\",\"cache.pool.connections.initial\":\"16\",\"cache.pool.connections.max\":\"100\",\"cache.pool.connections.maxIdle\":\"300000\",\"cache.pool.connections.min\":\"16\",\"cache.server.weights\":\"1, 1\",\"cache.servers\":\"127.0.0.1:11211, 127.0.0.1:11212\",\"cache.super.period\":\"5000\",\"cache.tag\":\"trunk\",\"certificate.generate.tempdir\":\"/tmp/csr\",\"certificate.provider.openssl.location\":\"/usr/bin/openssl\",\"cookie.maxage\":\"604800\",\"crypto.transferCookieAge\":\"300\",\"data.hibernate.c3p0.max_size\":\"20\",\"data.shards\":\"shard0:shard0:localhost:3306:shard0, shard1:shard1:localhost:3306:shard1\",\"desktop-badge-height\":\"180\",\"desktop-badge-width\":\"217\",\"desktop-image-height\":\"100\",\"desktop-image-width\":\"100\",\"destination.android.host\":\"e100-proxy-01.feedhenry.net\",\"destination.android.path\":\"/digman/android\",\"destination.android.port\":\"\",\"destination.android.scheme\":\"https\",\"destination.blackberry.host\":\"e100-proxy-01.feedhenry.net\",\"destination.blackberry.path\":\"/digman/blackberry\",\"destination.blackberry.port\":\"\",\"destination.blackberry.scheme\":\"https\",\"destination.default.scheme\":\"https\",\"destination.iphone.host\":\"cgn1dig1.henora.net\",\"destination.iphone.path\":\"/digger/ios\",\"destination.iphone.port\":\"8080\",\"destination.iphone.scheme\":\"https\",\"destination.windowsphone7.host\":\"e100-proxy-01.feedhenry.net\",\"destination.windowsphone7.path\":\"/digman/wp7\",\"destination.windowsphone7.port\":\"\",\"destination.windowsphone7.scheme\":\"https\",\"dev-logout-location\":\"/box/dev\",\"dev-show-export\":\"true\",\"digger.request.sendfiles\":\"true\",\"digger.savebinary\":\"false\",\"ditch.client.enabled\":\"true\",\"ditch.client.server.dataEndPoint\":\"/data/\",\"ditch.client.server.pingEndPoint\":\"/sys/info/ping\",\"ditch.client.server.url\":\"http://localhost:8443\",\"domain\":\"apps\",\"domain-name\":\"FeedHenry\",\"domain-url\":\"apps.rollins.henora.net\",\"email-password-reset\":\"no-reply@feedhenry.com\",\"email-password-set\":\"no-reply@feedhenry.com\",\"email-registration\":\"registration@feedhenry.com\",\"fb-detail\":\"FeedHenry Widgets allow you to put the best of the web where you want it\",\"fb-header\":\"My FeedHenry Widgets\",\"fb-show-default-profile-footer\":\"false\",\"fb-show-default-profile-header\":\"false\",\"feedhenry-domain\":\"rollins.henora.net\",\"feedhenry.cluster\":\"development\",\"feedhenry.domainsuffix\":\"rollins.henora.net\",\"feedhenry.domainsuffix.internal\":\"rollins.henora.net\",\"feedhenry.node\":\"node01\",\"feedhenry.numnodes\":\"2\",\"fhcore.staging\":\"false\",\"fhcore.url\":\"https://127.0.0.1:9443\",\"geoip.database.city.location\":\"/opt/feedhenry/data/geoip/GeoIPCity.dat\",\"geoip.database.isp.location\":\"/opt/feedhenry/data/geoip/GeoIPISP.dat\",\"geoip.database.org.location\":\"/opt/feedhenry/data/geoip/GeoIPOrg.dat\",\"geoip.service.type\":\"localdatabase\",\"geoip.webServiceKey\":\"Z79LLdQzYouI\",\"guestManager.autocache\":\"false\",\"guestManager.cachingEnabled\":\"true\",\"guestManager.fullpagecache\":\"false\",\"guestManager.numGuestProfiles\":\"10\",\"iphone.app.freeTrial\":\"30\",\"iphone.app.receiptVerify\":\"https://sandbox.itunes.apple.com/verifyReceipt\",\"iphone.feedback.host\":\"feedback.sandbox.push.apple.com\",\"iphone.feedback.port\":\"2196\",\"iphone.push.host\":\"gateway.sandbox.push.apple.com\",\"iphone.push.port\":\"2195\",\"mail.imap.class\":\"com.sun.mail.imap.IMAPStore\",\"mail.imap.host\":\"localhost\",\"mail.smtp.class\":\"com.sun.mail.smtp.SMTPTransport\",\"mail.smtp.host\":\"localhost\",\"mail.store.protocol\":\"imap\",\"mail.transport.protocol\":\"smtp;\",\"messaging.apache.dir\":\"/log/apache\",\"messaging.apache.enabled\":\"false\",\"messaging.apache.messagesPerBatch\":\"150\",\"messaging.apache.poll\":\"10000\",\"messaging.apache.topic\":\"apache\",\"messaging.apikey\":\"ce4dd47e7fcfdeb14203196c2b1a469d\",\"messaging.backupAllMessagesToLog\":\"true\",\"messaging.client.delay\":\"5000\",\"messaging.client.enabled\":\"false\",\"messaging.client.messageServer.messageEndPoint\":\"/msg/\",\"messaging.client.messageServer.pingEndPoint\":\"/sys/info/ping\",\"messaging.client.messageServer.url\":\"http://localhost:8888\",\"messaging.client.recovery.dir\":\"/log/metrics\",\"messaging.client.recovery.poll\":\"10000\",\"metrics.apikey\":\"a2c3a32da17b463c7a2da18977bf940b\",\"metrics.client.enabled\":\"true\",\"metrics.client.server.metricsEndPoint\":\"/metric/\",\"metrics.client.server.pingEndPoint\":\"/sys/info/ping\",\"metrics.client.server.url\":\"http://localhost:8888\",\"milliwriter.fileBase\":\"/opt/coolstack/apache2/htdocs/static\",\"mobile-control-functions-type\":\"normal\",\"modelManager.archiveFolder\":\"/log/mcarc\",\"nodejs.cfpwd\":\"cct71iB/957VbYid4BU+yQ==\",\"nodejs.cfurl\":\"https://api.cf.live.stg.feedhenry.net\",\"nodejs.cfuser\":\"millicore.cf1-vnv@feedhenry.com\",\"nodejs.development_usefulldf\":\"true\",\"nodejs.developmenttarget\":\"dynofarm\",\"nodejs.dfpwd_development\":\"feedhenry101\",\"nodejs.dfpwd_release\":\"feedhenry101\",\"nodejs.dfurl_development\":\"https://api.df.dev.stg.feedhenry.net\",\"nodejs.dfurl_release\":\"https://api.df.live.stg.feedhenry.net\",\"nodejs.dfuser_development\":\"feedhenry\",\"nodejs.dfuser_release\":\"feedhenry\",\"nodejs.dynofarmurls\":\"http://127.0.0.1:8000\",\"nodejs.enabled\":\"true\",\"nodejs.include_app_js\":\"true\",\"nodejs.numappinstances\":\"1\",\"nodejs.releasetarget\":\"dynofarm\",\"nodejs.use_old_appnaming\":\"false\",\"password.resetExpiryTime\":\"2\",\"password.retrieval\":\"reset\",\"password.setExpiryTime\":\"720\",\"password.upload.salt\":\"salt\",\"property.base\":\"true\",\"property.clusterbase\":\"true\",\"property.instance\":\"true\",\"property.source\":\"clusterdb\",\"reaper.feedperiod\":\"1200\",\"reaper.socketTimeout\":\"60\",\"restrict.login.active\":\"false\",\"restrict.login.builds.active\":\"false\",\"restrict.login.builds.duration\":\"86400\",\"restrict.login.builds.limit\":\"200\",\"restrict.login.chain\":\"emailbypass,global,emailwhitelist,builds,creates,logins\",\"restrict.login.creates.active\":\"false\",\"restrict.login.creates.duration\":\"86400\",\"restrict.login.creates.limit\":\"200\",\"restrict.login.emailblacklist.active\":\"false\",\"restrict.login.emailblacklist.domains\":\"\",\"restrict.login.emailbypass.active\":\"false\",\"restrict.login.emailbypass.whitelist\":\"@example.com,@feedhenry.com\",\"restrict.login.emailwhitelist.active\":\"false\",\"restrict.login.emailwhitelist.domains\":\"\",\"restrict.login.global.active\":\"false\",\"restrict.login.logins.active\":\"false\",\"restrict.login.logins.duration\":\"86400\",\"restrict.login.logins.limit\":\"200\",\"s0.17057304353505143\":\"s0.09829089258194612\",\"s0.740834520404978\":\"s0.3422990794554318\",\"sandbox-show-account-section\":\"true\",\"sandbox-show-logout-link\":\"true\",\"scheduler.numShards\":\"2\",\"scheduler.parseperiod\":\"100000\",\"scheduler.shard\":\"-1\",\"scm.ext.createfileurl\":\"http://127.0.0.1:9876/fhgithub/createfile\",\"scm.ext.git.crud.enabled\":\"false\",\"scm.ext.git.enabled\":\"true\",\"scm.ext.git.private.enabled\":\"true\",\"scm.ext.host\":\"http://127.0.0.1:9876\",\"scm.ext.listurl\":\"http://127.0.0.1:9876/fhgithub/listfiles/development-WIDGETGUID\",\"scm.ext.refresh\":\"http://127.0.0.1:9876/fhgithub/trigger\",\"scm.ext.updatefileurl\":\"http://127.0.0.1:9876/fhgithub/updatefile\",\"scm.ext.url\":\"http://127.0.0.1:9876/development-WIDGETGUIDFULLPATH\",\"scm.ext.zipurl\":\"http://127.0.0.1:9876/fhgithub/zip/development-WIDGETGUID\",\"script.execution.fhserver.logInfo\":\"false\",\"script.execution.instructionObserverThreshold\":\"5000\",\"script.execution.timeout\":\"10000\",\"script.scope.resolver.evaluateable.enabled\":\"true\",\"script.scope.resolver.executable.enabled\":\"true\",\"script.scope.resolver.executable.maxItems\":\"100\",\"script.scope.resolver.serializable.enabled\":\"true\",\"secure-host-url\":\"http://secure.rollins.henora.net\",\"server.environment\":\"development\",\"service.system.heartbeat\":\"yes\",\"service.system.performanceThreshold\":\"500\",\"service.system.returnDebugInfo\":\"true\",\"show-dock-carousel\":\"false\",\"stats.apikey\":\"4972afa9489b7dfbbaa6dbce4e3a305fef3a802e1831dfe5e590965e1fee0f43\",\"stats.client.enabled\":\"true\",\"stats.server.url.dev\":\"http://localhost:8443\",\"stats.server.url.live\":\"http://localhost:8443\",\"status.logfolder\":\"/log/status\",\"stpg-activate-fail\":\"http://apps.rollins.henora.net/box/index/login?reason=\",\"stpg-activate-url\":\"http://apps.rollins.henora.net/box/srv/1.1/act/sys/auth/activate?p=stpg&k=\",\"stpg-auto-register\":\"yes\",\"stpg-base-survey-url\":\"http://apps.rollins.henora.net/box/index/survey\",\"stpg-cont-nav\":\"bottom\",\"stpg-default-initial-category\":\"featured\",\"stpg-display-login\":\"\",\"stpg-dock-accordion-item0\":\"{id:\'categories\', title:\'Categories\', enabled:true, selected:true}\",\"stpg-dock-accordion-item1\":\"{id:\'getWidget\', title:\'Get an App\', enabled:true, selected:false, exclude: [\'mobile\']}\",\"stpg-dock-accordion-item2\":\"{id:\'buildWidget\', title:\'Build an App\', enabled:true, selected:false, exclude: [\'mobile\']}\",\"stpg-dock-accordion-items\":\"0,1,2\",\"stpg-dock-add-btn-text\":\"{\'feedhenry\':\'Add To Page\', \'mobile\':\'Add To Mobile\', \'tv\':\'Add To Tv\'}\",\"stpg-dock-add-page-insert-position\":\"before\",\"stpg-dock-alert-max-widgets\":\"Sorry, You can\'t add any more apps to this page\",\"stpg-dock-close-btn-text\":\"Close Dock\",\"stpg-dock-headline\":\"Thousands of Widgets for your appspage, Blog, Mobile or Webpage!\",\"stpg-dock-listing-text\":\"App Listing\",\"stpg-dock-open-btn-text\":\"Add Apps\",\"stpg-dock-search-button-text\":\"Search Apps\",\"stpg-dock-search-text\":\"Search All Apps\",\"stpg-dock-show-visual-widget-builder\":\"true\",\"stpg-dock-show-widgets-by-tabs\":\"false\",\"stpg-dock-style\":\"dock2\",\"stpg-dock-title\":\"Click to Find, Sort and Share Widgets - Now!\",\"stpg-dock-widget-message\":\"Widget\",\"stpg-dynamic-layout\":\"false\",\"stpg-enable-app-rating\":\"false\",\"stpg-enable-app-ratingbegins-after\":\"5\",\"stpg-enable-mobile-preview\":\"false\",\"stpg-external-login\":\"\",\"stpg-external-register\":\"\",\"stpg-footer-include\":\"\",\"stpg-google-analytics\":\"UA-15625847-1\",\"stpg-header-cachetimeout\":\"\",\"stpg-header-include\":\"\",\"stpg-header-top-include\":\"\",\"stpg-header-welcome\":\"Welcome to apps Widgets...Get your Own Personal apps Widget Page!\",\"stpg-help-application-name\":\"Feedhenry\",\"stpg-help-contact-us\":\"noreply@feedhenry.com\",\"stpg-help-content-save\":\"In order to save your settings, you must be a registered user.\",\"stpg-help-message\":\"Pull Widget to Page or Add to Social Network\",\"stpg-include-customisations-active\":\"false\",\"stpg-init-forcelogin\":\"false\",\"stpg-initial-dynamic-layout\":\"1\",\"stpg-lnf\":\"lnf1\",\"stpg-login\":\"http://apps.rollins.henora.net/box/index/login\",\"stpg-login-fail\":\"http://apps.rollins.henora.net/box/index/login?retry=yes\",\"stpg-login-ok\":\"http://apps.rollins.henora.net/box/srv/1.1/act/sys/auth/signover?r=http://apps.rollins.henora.net/box/index&t=\",\"stpg-max-pages\":\"8\",\"stpg-min-col-width\":\"15\",\"stpg-mobile-message\":\"Add apps to the mobile emulator\",\"stpg-mobile-show-tooltip\":\"false\",\"stpg-num-layout-cols\":\"4\",\"stpg-product\":\"Startpage\",\"stpg-redirect-activate\":\"\",\"stpg-register\":\"http://apps.rollins.henora.net/box/index/register\",\"stpg-register-fail\":\"http://apps.rollins.henora.net/box/index/register?status=\",\"stpg-register-ok\":\"http://apps.rollins.henora.net/box/index/registered\",\"stpg-registered-msg\":\"Thank you and enjoy your startpage, \\\"The best of the web, all in one place\\\".\",\"stpg-reminder\":\"http://apps.rollins.henora.net/box/index/reminder\",\"stpg-resendactivation\":\"http://apps.rollins.henora.net/box/index/resend\",\"stpg-resetpassword\":\"http://apps.rollins.henora.net/box/index/resetpassword\",\"stpg-setpassword\":\"http://apps.rollins.henora.net/box/index/resetpassword\",\"stpg-show-add-feed\":\"true\",\"stpg-show-add-wallpaper\":\"true\",\"stpg-show-colorpicker\":\"true\",\"stpg-show-featured\":\"true\",\"stpg-show-header-welcome\":\"true\",\"stpg-show-help\":\"true\",\"stpg-show-mobile-edit-icon\":\"true\",\"stpg-show-mobile-tab\":\"true\",\"stpg-show-new\":\"true\",\"stpg-show-newPage\":\"true\",\"stpg-show-profile\":\"true\",\"stpg-show-recommended\":\"false\",\"stpg-show-signin\":\"true\",\"stpg-show-signup\":\"true\",\"stpg-show-tabs\":\"true\",\"stpg-show-tv-tab\":\"false\",\"stpg-show-wallpapers\":\"true\",\"stpg-tabs-newPage-name\":\"New Page\",\"stpg-third-party-analytics\":\"false\",\"stpg-title\":\"Feedhenry\",\"stpg-tooltip-extra-message\":\"\",\"stpg-url-tag\":\"\",\"stpg-widget-limit\":\"30\",\"stpg_dock_share_to_message\":\"Share to:\",\"stpg_tabs_startPage\":\"Start Page\",\"studio-activate-fail\":\"https://apps.rollins.henora.net?message=\",\"studio-activate-url\":\"https://apps.rollins.henora.net/box/srv/1.1/act/sys/auth/activate?p=studio&k=\",\"studio-allowed-email-domains\":\"\",\"studio-display-login\":\"\",\"studio-header-logo-east-enabled\":\"false\",\"studio-js-app-generation-enabled\":\"true\",\"studio-js-blackberry-binary-enabled\":\"true\",\"studio-js-build-options-android\":\"{\\\"config\\\":[{\\\"label\\\":\\\"2.2\\\",\\\"value\\\":\\\"2.2\\\"},{\\\"label\\\":\\\"2.3\\\",\\\"value\\\":\\\"2.3\\\"},{\\\"label\\\":\\\"4.0\\\",\\\"value\\\":\\\"4.0\\\"}]}\",\"studio-js-build-options-blackberry\":\"{\\\"config\\\":[{\\\"label\\\":\\\"6.0\\\",\\\"value\\\":\\\"7.0\\\"},{\\\"label\\\":\\\"7.0\\\",\\\"value\\\":\\\"7.0\\\"}]}\",\"studio-js-build-options-ios\":\"{\\\"config\\\":[{\\\"label\\\":\\\"3.0\\\",\\\"value\\\":\\\"3.0\\\"},{\\\"label\\\":\\\"4.0\\\",\\\"value\\\":\\\"4.0\\\"},{\\\"label\\\":\\\"5.0\\\",\\\"value\\\":\\\"4.0\\\"}]}\",\"studio-js-build-options-ipad\":\"{\\\"config\\\":[{\\\"label\\\":\\\"3.2\\\",\\\"value\\\":\\\"3.2\\\"},{\\\"label\\\":\\\"4.3\\\",\\\"value\\\":\\\"4.3\\\"},{\\\"label\\\":\\\"5.0\\\",\\\"value\\\":\\\"5.0\\\"}]}\",\"studio-js-build-options-iphone\":\"{\\\"config\\\":[{\\\"label\\\":\\\"3.0\\\",\\\"value\\\":\\\"3.0\\\"},{\\\"label\\\":\\\"4.3\\\",\\\"value\\\":\\\"4.3\\\"},{\\\"label\\\":\\\"5.0\\\",\\\"value\\\":\\\"5.0\\\"}]}\",\"studio-js-build-options-wp7\":\"{\\\"config\\\":[{\\\"label\\\":\\\"7.0\\\",\\\"value\\\":\\\"7.0\\\"},{\\\"label\\\":\\\"7.1\\\",\\\"value\\\":\\\"7.1\\\"}]}\",\"studio-js-dashboard-docs-default\":\"[{\\\"id\\\":\\\"getting_started\\\",\\\"url\\\":\\\"http://docs.feedhenry.com/getting_started.html\\\"},{\\\"id\\\":\\\"api\\\",\\\"url\\\":\\\"http://docs.feedhenry.com/api_reference.html\\\"},{\\\"id\\\":\\\"build_app\\\",\\\"url\\\":\\\"http://docs.feedhenry.com/app_building_and_submission.html\\\"},{\\\"id\\\":\\\"training_labs\\\",\\\"url\\\":\\\"http://docs.feedhenry.com/training_labs.html\\\"},{\\\"id\\\":\\\"dev_tools\\\",\\\"url\\\":\\\"http://docs.feedhenry.com/developer_tools.html\\\"}]\",\"studio-js-dashboard-docs-v1\":\"[{\\\"id\\\":\\\"getting_started\\\",\\\"url\\\":\\\"http://docs.feedhenry.com/v1/getting_started.html\\\"},{\\\"id\\\":\\\"api\\\",\\\"url\\\":\\\"http://docs.feedhenry.com/v1/api_reference.html\\\"},{\\\"id\\\":\\\"build_app\\\",\\\"url\\\":\\\"http://docs.feedhenry.com/v1/app_building_and_submission.html\\\"},{\\\"id\\\":\\\"training_labs\\\",\\\"url\\\":\\\"http://docs.feedhenry.com/v1/training_labs.html\\\"},{\\\"id\\\":\\\"dev_tools\\\",\\\"url\\\":\\\"http://docs.feedhenry.com/v1/developer_tools.html\\\"}]\",\"studio-js-dashboard-docs-v2\":\"[{\\\"id\\\":\\\"getting_started\\\",\\\"url\\\":\\\"http://docs.rollins.henora.net:8080/v2/getting_started.html\\\"},{\\\"id\\\":\\\"api\\\",\\\"url\\\":\\\"http://docs.rollins.henora.net:8080/v2/api_reference.html\\\"},{\\\"id\\\":\\\"build_app\\\",\\\"url\\\":\\\"http://docs.rollins.henora.net:8080/v2/app_building_and_submission.html\\\"},{\\\"id\\\":\\\"training_labs\\\",\\\"url\\\":\\\"http://docs.rollins.henora.net:8080/v2/training_labs.html\\\"},{\\\"id\\\":\\\"dev_tools\\\",\\\"url\\\":\\\"http://docs.rollins.henora.net:8080/v2/developer_tools.html\\\"}]\",\"studio-js-disabled-accordion-items\":\"[\\\"preview\\\"]\",\"studio-js-disabled-tabs\":\"[\\\"community-tab\\\"]\",\"studio-js-docs-url\":\"http://docs.feedhenry.com\",\"studio-js-editor\":\"Ace\",\"studio-js-enable-per-app-metrics\":\"true\",\"studio-js-enable-push-notification\":\"true\",\"studio-js-enabled-remote-debug\":\"true\",\"studio-js-forgot-pw-url\":\"\",\"studio-js-google-analytics-enabled\":\"true\",\"studio-js-google-analytics-id\":\"UA-20408185-1\",\"studio-js-hiring-link\":\"false\",\"studio-js-hiring-url\":\"http://www.feedhenry.com/about-feedhenry/careers\",\"studio-js-ios-universal-enabled\":\"true\",\"studio-js-landing-docs-default\":\"{\\\"docs_fhc\\\": \\\"http://docs.feedhenry.com/fhc_command_line_tool.html\\\", \\\"docs_fhc_labs\\\": \\\"http://docs.feedhenry.com/fhc_labs.html\\\", \\\"docs_tutorial\\\": \\\"http://docs.feedhenry.com/training_labs.html\\\", \\\"docs_video\\\":\\\"http://docs.feedhenry.com/videos.html\\\", \\\"docs_api\\\":\\\"http://docs.feedhenry.com/api_reference.html\\\", \\\"docs_fhc_more\\\":\\\"http://docs.feedhenry.com/fhc_command_line_tool.html\\\"}\",\"studio-js-landing-docs-v1\":\"{\\\"docs_fhc\\\": \\\"http://docs.feedhenry.com/v1/fhc_command_line_tool.html\\\", \\\"docs_fhc_labs\\\": \\\"http://docs.feedhenry.com/v1/fhc_labs.html\\\", \\\"docs_tutorial\\\": \\\"http://docs.feedhenry.com/v1/training_labs.html\\\", \\\"docs_video\\\":\\\"http://docs.feedhenry.com/v1/videos.html\\\", \\\"docs_api\\\":\\\"http://docs.feedhenry.com/v1/api_reference.html\\\", \\\"docs_fhc_more\\\":\\\"http://docs.feedhenry.com/v1/fhc_command_line_tool.html\\\"}\",\"studio-js-landing-docs-v2\":\"{\\\"docs_fhc\\\": \\\"http://docs.feedhenry.com/v2/fhc_command_line_tool.html\\\", \\\"docs_fhc_labs\\\": \\\"http://docs.feedhenry.com/v2/fhc_labs.html\\\", \\\"docs_tutorial\\\": \\\"http://docs.feedhenry.com/v2/training_labs.html\\\", \\\"docs_video\\\":\\\"http://docs.feedhenry.com/v2/videos.html\\\", \\\"docs_api\\\":\\\"http://docs.feedhenry.com/v2/api_reference.html\\\", \\\"docs_fhc_more\\\":\\\"http://docs.feedhenry.com/v2/fhc_command_line_tool.html\\\"}\",\"studio-js-login-footer-text\":\"\",\"studio-js-mixpanel-api-key\":\"9f8cac0ab00e0ac8b81d85f7570d9559\",\"studio-js-mixpanel-enabled\":\"true\",\"studio-js-mixplanel-test\":\"true\",\"studio-js-reporting-flurry\":\"https://dev.flurry.com/secure/login.do\",\"studio-js-reporting-ga\":\"https://www.google.com/accounts/ServiceLogin?service=analytics&passive=true&nui=1&hl=en&continue=https://www.google.com/analytics/settings/&followup=https://www.google.com/analytics/settings/\",\"studio-js-reporting-metrics-enabled\":\"true\",\"studio-js-reporting-mixpanel\":\"https://mixpanel.com/user/login/\",\"studio-js-reporting-reports-enabled\":\"true\",\"studio-js-reporting-sampledata-enabled\":\"false\",\"studio-js-scm-editor-text\":\"Git app - all files are committed & pushed when saved. To avoid conflicts pull before editing.\",\"studio-js-scm-file-delete\":\"false\",\"studio-js-scm-file-rename\":\"false\",\"studio-js-state-persistance\":\"true\",\"studio-js-stats-enabled\":\"true\",\"studio-js-stats-sampledata-enabled\":\"false\",\"studio-js-support-url\":\"http://support.feedhenry.com\",\"studio-js-wp7-binary-enabled\":\"true\",\"studio-landing-page\":\"login.html\",\"studio-login\":\"https://apps.rollins.henora.net\",\"studio-login-fail\":\"https://apps.rollins.henora.net\",\"studio-login-ok\":\"https://apps.rollins.henora.net\",\"studio-product\":\"App Studio\",\"studio-protocol\":\"https\",\"studio-redirect-activate\":\"https://apps.rollins.henora.net?message=registration_activated\",\"studio-registered-msg\":\"\",\"studio-resetpassword\":\"https://apps.rollins.henora.net/box/ide/reset.html\",\"studio-setpassword\":\"https://apps.rollins.henora.net/box/ide/activate.html\",\"studio.landing.auth\":\"index\",\"studio.landing.auth.pages\":\"index\",\"studio.landing.auth.pages.weights\":\"\",\"studio.landing.google.analytics.apikey\":\"\",\"studio.landing.google.analytics.enabled\":\"false\",\"studio.landing.legaltext\":\"By using this site or its services, you are agreeing to the FeedHenry <a href=\\\"http://feedhenry.com/security-privacy/\\\">privacy policy<\\/a> and <a href=\\\"http://www.feedhenry.com/terms\\\">terms and conditions<\\/a>\",\"studio.landing.mixpanel.apikey\":\"\",\"studio.landing.mixpanel.enabled\":\"false\",\"studio.landing.mixpanel.test\":\"false\",\"studio.landing.noauth\":\"login\",\"studio.landing.noauth.pages\":\"login\",\"studio.landing.noauthauth.pages.weights\":\"\",\"studio.login\":\"login\",\"studio.login.pages\":\"login\",\"studio.login.pages.weights\":\"\",\"studio.privacylink\":\"http://feedhenry.com/security-privacy/\",\"studio.tandclink\":\"http://www.feedhenry.com/terms\",\"studio.templates.showFromCustomer\":\"true\",\"studio.templates.showFromReseller\":\"true\",\"swagger.max_wait_time\":\"15\",\"swagger.track_common_tables\":\"widg_TemplateInstance,widg_Widget,widg_Category,sys_Sub\",\"swagger.track_debug\":\"false\",\"swagger.track_domain_tables\":\"WidgetInstance,User\",\"swagger.track_domains\":\"\",\"swagger.valid_duration\":\"2\",\"swagger.valid_session\":\"5\",\"sys.path.base\":\"/work/millicore-git/src/main/webapp/box/WEB-INF/millicore\",\"threadExecuter.numThreads\":\"30\",\"webClientManager.connectionManager.timeout\":\"2000\",\"webClientManager.httpConnection.timeout\":\"2000\",\"webClientManager.max.connections\":\"150\",\"webClientManager.request.timeout\":\"5000\",\"webClientManager.socket.timeout\":\"2000\",\"widget-footer-height\":\"29\",\"widget-header-height\":\"23\",\"widget-icon-large\":\"96x96\",\"widget-static-minify-css\":\"true\",\"widget-static-minify-js\":\"true\",\"widget-webslice-enabled\":\"true\",\"widget.export.android.sdklocation\":\"/tools/mobile/android/android-sdk-windows\",\"widget.export.android.task\":\"PhoneGap090\",\"widget.export.generator.host\":\"rollins.henora.net\",\"widget.export.includewrappers\":\"false\",\"widget.export.ios.xcode.3.0\":\"/Developer/xcode-3.2.2\",\"widget.export.ios.xcode.4.0\":\"/Developer/xcode-3.2.3\",\"widget.export.legacy\":\"false\",\"widget.export.location\":\"/opt/coolstack/apache2/htdocs/static/widgets\",\"widget.export.output.urlpath\":\"/static/widgets\",\"widget.export.spawn.timeout\":\"5000\",\"widget.export.temp.location\":\"/tmp/widgets\",\"widget.hostname\":\"rollins.henora.net\",\"widget.serverside.usecache\":\"true\"}}");
          mUC = new JSONObject();
        } catch (Throwable e) {
          System.out.println(e);
          e.printStackTrace();
        } finally {
          br.close();
          iSR.close();
        }
      }
      
      // TODO: Get domain from props
      mDomain = "apps";
      proceed = true;
    }

    if (proceed) {

      // Allow for domain props being passed in request
//      if( null == mStudioProps ) {
//        // no user context available at this time, so use system user context
//        mStudioProps = PropsManager.getDomainPropSet(JSONObject.SYSTEM_USERCONTEXT, mDomain);
//      }
      String requiredProtocol = "https";// mStudioProps.getString(PROTOCOL_PROPERTY);
  
      String selectedProtocol = "https";// RequestUtil.resolveScheme(pRequest);
  
      // Ensure that we are using the correct protocol (https by default);
      if (!requiredProtocol.equals(selectedProtocol)) {
        String serverName = pRequest.getServerName();
        String redirect = requiredProtocol + "://" + serverName;
        redirectUrl = redirect;
        proceed = false;
      }
    }

    if (null != redirectUrl) {
      // If a redirect url has been set, send the redirect.
      pResponse.sendRedirect(redirectUrl);
    } else {
      setNoCacheHeaders(pResponse);
      mInput = JSONObject.fromObject(pRequest.getParameterMap());
      System.out.println(mInput.toString(2));
    }

    return proceed;
  }

  public boolean canProceed(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageName) throws Exception {
    boolean canProceed = false;
    
    JSONObject uc = new JSONObject();
    
    // check permissions
    this.mLoggedIn = checkAuthenticatedUser(pRequest, uc);

    JSONObject reqJson = JSONObject.fromObject(pRequest.getParameterMap());    
    String reqUri = pRequest.getRequestURI();    
    String reqPage = reqJson.optString("a", null);
    boolean checkPage = DEFAULT_URL.equals(reqUri);
        
    if( checkPage ) {
      if( null != reqPage && mAllowedActionRequest.contains(reqPage) )  {
        if( mLoggedIn ) {
          if (reqPage.equals(IDE_LANDING)) {
            reqPage = getPropPage(pRequest, pResponse, AUTH_LANDING_PAGES);
          } else if (reqPage.equals(IDE_LOGIN)) {
            reqPage = getPropPage(pRequest, pResponse, LOGIN_PAGES);
          }
          dispatchTo(pRequest, pResponse, reqPage);
        } else {
          if (reqPage.equals(IDE_LOGIN)) {
            dispatchToProp(pRequest, pResponse, LOGIN_PAGES);
          } else {
            dispatchToProp(pRequest, pResponse, NOAUTH_LANDING_PAGES);
          }
        }
      } else {
        if (mLoggedIn) {
          dispatchToProp(pRequest, pResponse, AUTH_LANDING_PAGES);
        } else {
          dispatchToProp(pRequest, pResponse, NOAUTH_LANDING_PAGES);
        }
      }
    } else {
      if (mLoggedIn) {
        canProceed = true;
      }
      else {
        JSONArray noAuthFiles = mServerProps.getJSONArray(NOAUTH_LANDING_PAGES);
        JSONArray loginFiles = mServerProps.getJSONArray(LOGIN_PAGES);        
        
        if( noAuthFiles.contains(pPageName) || loginFiles.contains(pPageName)) {
          canProceed = true;
        }
        else {
          String requiredProtocol = "https"; // TODO: mStudioProps.get(PROTOCOL_PROPERTY);
          String serverName = pRequest.getServerName();
          String noAuthFile = "login"; // TODO: mStudioProps.get(LOGIN);
          String redirect = requiredProtocol + "://" + serverName + "?a=" + noAuthFile;

          pResponse.sendRedirect(redirect);
        }
      }
    }

    return canProceed;
  }

  /**
   * TODO This method updates member field mUC
   */
  private boolean checkAuthenticatedUser(HttpServletRequest pRequest, JSONObject uc)throws Exception {
    // TODO: acually check if user is logged in. maybe from mStuidoProps
    
    return true;
  }

  public boolean isLoggedIn() {
    return mLoggedIn;
  }

  public String getEmail() {
    return "TODO@example.com"; // TODO: mUC.getEmail();
  }

  public String getAccountType() {
    return "TODO-ACCOUNT-TYPE"; // mUC.getAccountType();
  }

  private void dispatchToProp(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageProp) throws Exception {
    String dispatchFile = getPropPage(pRequest, pResponse, pPageProp);

    dispatchTo(pRequest, pResponse, dispatchFile);
  }

  private String getPropPage(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageProp) {
    String dispatchFile = null;
    
    String dispatchFileProp = "index.html";// TODO: mStudioProps.get(pPageProp);

    String[] dispatchFiles = dispatchFileProp.split(",");
    // don't check array has at least one entry to ensure property is always set
    // i.e. if property isn't set, exception is thrown
    int pageNum = 0;
    int numPages = dispatchFiles.length;

    // only kick in page num logic if we have more than 1 possible page
    if (numPages > 1) {
      // check if we have a cookie that dictates page to use
      Cookie landing = null; // TODO: ServletUtil.getCookie(STUDIO_PAGES_GROUP_COOKIE, pRequest);
      String landingVal = null;
      if (null != landing) {
        landingVal = landing.getValue();
      }
      if (null != landingVal && !"".equals(landingVal)) {
        // have a val, does it match an array index
        try {
          pageNum = Integer.parseInt(landingVal);
        } catch (NumberFormatException nFE) {
          // log issue, generate new page num and continue
          pageNum = generatePageNum(numPages, pPageProp);
        }
      } else {
        pageNum = generatePageNum(numPages, pPageProp);
      }

      if (numPages < pageNum + 1) {
        // somehow got a dud page num, generate new page num and continue
        pageNum = generatePageNum(numPages, pPageProp);
        if (numPages < pageNum + 1) {
          // still got a dud page num, something odd here
          // num weights and pages not the same??
          // default to 0
          pageNum = 0;
        }
      }

      // store pagenum in cookie
      Cookie pageNumCookie = new Cookie(STUDIO_PAGES_GROUP_COOKIE, Integer.toString(pageNum));
      pResponse.addCookie(pageNumCookie);
    }

    dispatchFile = dispatchFiles[pageNum];

    return dispatchFile;
  }

  private int generatePageNum(int numPages, String pPageProp) {
    int pageNum = 0;

    // only generate a pagenum if we have at least 2 pages
    if (numPages > 1) {
      // generate a page num based on num pages and weights

      String dispatchFileWeight = "1"; // mStudioProps.get(pPageProp + ".weights");

      String[] weights = null;
      if (null != dispatchFileWeight && !"".equals(dispatchFileWeight)) {
        weights = dispatchFileWeight.split(",");
      } else {
        // use even distribution
        weights = new String[numPages];
        float dist = 1f / numPages;
        for (int wi = 0, wl = weights.length; wi < wl; wi++) {
          weights[wi] = Float.toString(dist);
        }
      }

      // have an array of weights, lets randomly generate a page num
      double randNum = Math.random();
      double total = 0;
      for (int wi = 0, wl = weights.length; wi < wl; wi++) {
        float wt = Float.parseFloat(weights[wi]);
        total += wt;
        if (randNum < total) {
          pageNum = wi;
          break;
        }
      }
    }

    return pageNum;
  }

  private void dispatchTo(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageName) throws Exception {
    String pPageUrl = resolveUrl(mDomain, pPageName);
    if( null != pPageUrl ) {
      pRequest.setAttribute("result", "fail");
      pRequest.setAttribute("orginal_URI", pRequest.getRequestURI());
      pRequest.setAttribute("Domain", mDomain);
      pRequest.setAttribute("StudioProps", mStudioProps);
      pRequest.setAttribute("Theme", mTheme);
      RequestDispatcher dispatcher = pRequest.getRequestDispatcher(pPageUrl);
      dispatcher.forward(pRequest, pResponse);
    }
    else {
      pResponse.sendError(404);
    }
  }

  private String resolveUrl(String pDomain, String pPage) throws Exception {
    String resolvedUrl = null;
    String themeName = getThemeName();

    if (!pPage.endsWith(".html")) {
      pPage += ".html";
    }

    String themeUrl = IDEWebBean.IDE_THEMES_FILE.replace("%theme%", themeName).replace("%file%", pPage);
    String defaultUrl = IDEWebBean.IDE_DEFAULT_FILE.replace("%file%", pPage);

    File fTheme = new File(mServletContext.getRealPath(themeUrl));
    File fDefault = new File(mServletContext.getRealPath(defaultUrl));
    if (fTheme.exists()) {
      resolvedUrl = themeUrl;
    } else if (fDefault.exists()) {
      resolvedUrl = defaultUrl;
    }
    return resolvedUrl;
  }

  /**
   * Set Headers for no caching of the response
   */
  // TODO: move this out to IdeSessionManager
  private void setNoCacheHeaders(HttpServletResponse pResponse) {
    pResponse.setHeader("Cache-Control", "no-cache");
    pResponse.setHeader("Pragma", "no-cache");
    pResponse.setDateHeader("Expires", -1);
  }

  public String getRevision() throws Exception {
    // String version = String.valueOf(mALM.getAssetControlVal());
    String version = "42";
    return version;
  }

  public String getAssetCtrlVal() throws Exception {
    // String val = String.valueOf(mALM.getAssetControlVal());
    String val = "42";
    return val;
  }

  public String getIdeThemeUrl() throws Exception {
    return "/static/ide/css/apps/default/42-style.css"; // TODO: mPropsBean.getThemeUrl(mDomain, getThemeName());
  }

  private String getThemeName() throws Exception {

    // Default to using the "default" theme
    String theme = "default";
    boolean resolved = false;

    // 1. Check if a theme has been specified in the URL
    if (null != mInput && mInput.has("theme")) {
      theme = mInput.getString("theme");
      resolved = true;
    }  
    
    // 2. Check if a theme has been assigned at the domain / customer / reseller level
    if( ! resolved ) {
      if( null == mTheme ) {
        mTheme = "default"; // TODO: mTheme = ResolveTenantUtil.resolveTheme(mDomain); 
      }

      if (!"".equals(mTheme)) {
        theme = mTheme;
        resolved = true;
      }
    }

    // 3. Check if the requesting user is an "enterprise" user
    /* TODO:
    if( ! resolved ) {
      if (null != mUC && (null != mUC.getAccountType()  && mUC.getAccountType().equals(UserPrefs.ACCOUNT_TYPE_ENTERPRISE_USER))){
        theme = IDEWebBean.THEME_ENTERPRISE;
        resolved = true;
      }
    }*/
    return theme;
  }

  public String getLanguage() {
    return "en";
  }

  public String getLoginDomain() {
    return mDomain;
  }

  public String getResetToken() {
    return mInput.optString("t");
  }

  public String getActivateToken() {
    return mInput.optString("t");
  }

  public JSONObject getProps() throws Exception {
    return mStudioProps;
  }

  public String getProperty(String pPropName) throws Exception {
    return mServerProps.getString(pPropName);
  }

  public Map<String, String> getDocsLinks() throws Exception {
    Map<String, String> links = new HashMap<String, String>();

    String linksStr = null;
    String nodeEnabled = getProperty("nodejs.enabled");

    if ("true".equals(nodeEnabled)) {
      linksStr = getProperty("studio-js-landing-docs-v2");
    } else {
      linksStr = getProperty("studio-js-landing-docs-default");
    }

    try {
      JSONObject linksJson = JSONObject.fromObject(linksStr);
      Iterator it = linksJson.keys();
      while (it.hasNext()) {
        String key = (String) it.next();
        String val = linksJson.getString(key);
        links.put(key, val);
      }
    } catch (Exception e) {
      //Explain.add(mExplain, "Error parsing json docs property :", e.getMessage());
    }

    return links;
  }

  public String getInfoMessage() {
    String message = "";
    if (mInput.has("message")) {
      message = mInput.getString("message");

      if (ALREADY_ACTIVATED.equals(message)) {
        message = "registration_already_activated";
      }
      if (NO_SUCH_ACTIVATION.equals(message)) {
        message = "registration_no_such_activation";
      }
      
    }
    return message;
  }

  public String getStaticAssetPath(String pPath) throws Exception {
    //String path = StpgAssetManager.insertAssetVersion(pPath, getLoginDomain());
    String out = pPath;
    long v = 42;
    int lastslash = pPath.lastIndexOf("/");
    if( -1 < lastslash ) {
      out = pPath.substring(0,lastslash)+"/"+v+"-"+pPath.substring(lastslash+1);
    }
    return out;
  }

  public String getThemeStaticAssetPath(String pPath) throws Exception {
    String fullPath = "ide/themes/" + getThemeName() + pPath;
    String staticPath = "/static/c/" + getStaticAssetPath(fullPath);
    return staticPath;
  }

  /**
   * Check if the currently logged in user is in the specified group
   */
  public boolean inGroup(String[] groups) throws Exception {
    boolean inGroup = false;
    // Make sure we're logged in
    if (null != mUC) {

      for (int pI = 0; pI < groups.length; pI++) {
        String group = groups[pI];
        //if (mUC.hasRole(group)) {
        if ("dev".equals(group) || "devadmin".equals(group)) {
          inGroup = true;
          break;
        }
      }

    }
    return inGroup;
  }

  public void addExplainError(Exception pException) {
    if (null != pException) {
//      Explain.add(mExplain, pException.getMessage());
    }
  }

  public String outputExplain() {
    StringBuilder sb = new StringBuilder();
//    Explain.endRequest(mExplain);

//    if (null != mExplain) {
//      sb.append("<!--\n");
//      sb.append(mExplain.toJSONObject().toString(2));
//      sb.append("\n!-->");
//    }

    return sb.toString();
  }
}

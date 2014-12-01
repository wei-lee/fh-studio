 package com.feedhenry.studio;

import java.io.*;
import java.net.URL;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;

public class StudioBean {

  // studio props endpoint
  private static final String PROPS_ENDPOINT = "/box/srv/1.1/studio/props";

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

  public static final String ROLE_CUSTOMERADMIN = "customeradmin";
  public static final String ROLE_RESELLERADMIN = "reselleradmin";

  public static final String THEME_DEFAULT = "default";
  public static final String THEME_ENTERPRISE = "enterprise";

  public static final Log log = LogFactory.getLog("fhstudio");
  public static final String PROP_PROTOCOL = "studioProtocol";
  public static final String PROP_LEGACYDIG = "legacyDig";
  public static final String PROP_GITENABLED = "gitEnabled";
  public static final String PROP_GITPRIVATEENABLED = "gitPrivateEnabled";
  public static final String PROP_SCMCRUDENABLED = "scmCrudEnabled";
  public static final String PROP_WRAPPERS = "includeWrappers";
  public static final String PROP_NODEJSENABLED = "nodejsEnabled";
  public static final String PROP_LOGINPAGE = "loginPage";
  public static final String PROP_LOGINPAGES = "loginPages";
  public static final String PROP_AUTHLANDING = "authLanding";
  public static final String PROP_NOAUTHLANDING = "noauthLanding";
  public static final String PROP_AUTHLANDINGPAGES = "authLandingPages";
  public static final String PROP_NOAUTHLANDINGPAGES = "noauthLandingPages";
  public static final String PROP_LANDINGDOCS = "landingDocs";
  public static final String PROP_FREEREGISTRATION = "freeRegistration";
  public static final String PROP_AUTHTYPE = "authType";
  public static final String PROP_LANDINGLEGALTEXT = "landingLegaltext";
  public static final String PROP_LANDINGMIXPANELENABLED = "landingMixpanelEnabled";
  public static final String PROP_LANDINGMIXPANELTEST = "landingMixpanelTest";
  public static final String PROP_LANDINGMIXPANELKEY = "landingMixpanelKey";
  public static final String PROP_LANDINGGOOGLEENABLED = "landingGoogleEanbled";
  public static final String PROP_LANDINGGOOGLEKEY = "landingGoogleKey";
  public static final String PROP_STUDIOVERSIONOPTION = "studioVersionOptionEnabled";
  public static final String PROP_STUDIOVERSION = "studioVersion";
  public static final String PROP_PLUGINS_ENABLED = "pluginsEnabled";

  public static final String APP_STORE_WRITE = "cluster/reseller/customer/domain/admin/app-store:write";
  public static final String CLOUD_RESOURCE_WRITE = "cluster/reseller/customer/domain/cloud-resources:write";
  public static final String CREDENTIAL_WRITE = "cluster/reseller/customer/domain/project/client-apps/credentials:write";
  public static final String CUSTOMER_ROLES_WRITE = "cluster/reseller/customer:write";
  public static final String DEPLOY_POLICY_WRITE = "cluster/reseller/customer/domain/admin/deploy-target:write";
  public static final String DOMAIN_ANALYTICS_READ = "cluster/reseller/customer/domain/analytics:read";
  public static final String DOMAIN_USERS_WRITE = "cluster/reseller/customer/domain/admin/user:write";
  public static final String FORM_READ = "cluster/reseller/customer/domain/drag-and-drop-app/form:read";
  public static final String PROJECT_READ = "cluster/reseller/customer/domain/project:read";
  public static final String PROJECT_WRITE = "cluster/reseller/customer/domain/project:write";
  public static final String RESELLER_ROLES_WRITE = "cluster/reseller:write";

  public static final List<String> mAllowedActionRequest = new ArrayList<String>();
  private static ArrayList<String> sSchemeHeaders = new ArrayList<String>();

  static {
    mAllowedActionRequest.add(IDE_LOGIN);
    mAllowedActionRequest.add(IDE_LANDING);
    mAllowedActionRequest.add(IDE_INDEX);
    
    sSchemeHeaders.add("X-Forwarded-Proto");
  }
  private ServletContext mServletContext;
  private JSONObject mInput;
  private String mDomain = null;
  private boolean mLoggedIn = false;
  private String mTheme = null;
  private String mPageName = null;
  private JSONObject mStudioProps = null;
  private JSONObject mCoreProps = null;
  private JSONObject mUserProps = null;
  private VersionBean mVersionBean;
  
  private static List<String> mFrameworkScripts = null;
  private static List<String> mIdeScripts = null;
  private static List<String> mIdeStyles = null;
  
  private static final String FRAMEWORK_SCRIPTS_LIST_PATH = "/scripts/framework-script.txt";
  private static final String IDE_SCRIPTS_LIST_PATH = "/scripts/ide-script.txt";
  private static final String IDE_STYLE_LIST_PATH = "/scripts/style-script.txt";
  
  private static final String FRAMEWORK_SCRIPTS_ALL_PATH = "all/framework-script-min.js";
  private static final String IDE_SCRIPT_ALL_PATH = "all/ide-script-min.js";
  private static final String IDE_STYLE_ALL_PATH = "all/ide-style-min.css";

  public void init(ServletContext pServletContext) throws Exception {
    mServletContext = pServletContext;
    log.info("StudioBean.init()");
    mVersionBean = new VersionBean();
  }

  public boolean initreq(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageName) throws Exception {
    String redirectUrl = null;
    boolean proceed = true;

    mPageName = pPageName;

    // Allow mDomain to be forwarded with request
    if (null != pRequest.getAttribute("Domain")) {
      mDomain = (String) pRequest.getAttribute("Domain");
    }

    // Allow mStudioProps to be forwarded with request
    if (null != pRequest.getAttribute("StudioProps")) {
      mStudioProps = (JSONObject) pRequest.getAttribute("StudioProps");
    }

    // Allow mTheme to be forwarded with request
    if (null != pRequest.getAttribute("Theme")) {
      mTheme = (String) pRequest.getAttribute("Theme");
    }

    String scheme = resolveScheme(pRequest);
    
    Cookie studioVersionCookie = getVersionCookie(pRequest);
    Cookie loginCookie = getCookie("feedhenry", pRequest);

    // Allow for domain being passed in request
    if (null == mDomain) {
      String referer = scheme + "://" + pRequest.getServerName();

      // TODO: allow self-signed cert in development
      scheme = "http";
      // keytool -import -alias localcert -file ./server.crt -keystore
      // /usr/lib/jvm/java-6-sun-1.6.0.26/jre/lib/security/cacerts -storepass
      // changeit

      JSONObject myCoreProps = getCoreProps(pRequest, pResponse, scheme, loginCookie, referer);

      if (null != myCoreProps) {
        mCoreProps = myCoreProps;
        /**
         * Support for multiple apps at / (e.g. fh-studio and fh-ngui)
         * Both fh-studio and fh-ngui will set a "feedhenry_v" cookie with a value of either "2" or "3"
         * 
         * Apache will use this to decide whether to proxy pass down to fh-ngui or fh-studio
         * 
         * If no feedhenry_v cookie set in a request to fh-studio, set it's initial value to 2
         */

        if (studioVersionCookie == null) {
          log.info("No initial fh_v for 2 cookie set, setting");
          addVersionCookie(pResponse, "2");
        }

        if (!"error".equals(mCoreProps.optString("status"))) {
          mStudioProps = mCoreProps.getJSONObject("clientProps");
          mDomain = mStudioProps.getString("domain");
          mUserProps = mCoreProps.optJSONObject("userProps");
          proceed = true;
        } else if ("unknown_domain".equals(mCoreProps.optString("message"))) {
          // issue with domain, unable to get props
          // redirect to corporate website
          proceed = false;
          redirectUrl = mCoreProps.optString("redirect", null);
          if (redirectUrl == null){
            log.info("Invalid domain requested - sending 404");
            pResponse.sendError(404, "Invalid domain requested: " + referer);
            return proceed;
          } else {
            log.info("Invalid domain requested - redirecting to " + redirectUrl + ", Got error from props endpoint: " + mCoreProps.toString());
          }
        } else {
          // unable to get props info from core, send 500
          proceed = false;
          log.error("Got error from props endpoint (" + mCoreProps.optString("message") + "), sending 500");
          pResponse.sendError(500);
        }

      } else {
        // redirect to corporate site
        proceed = false;
        pResponse.sendError(500);
      }
    }

    String requiredProtocol = scheme;
    String serverName = pRequest.getServerName();
    String studioVersion = null;

    if (mStudioProps != null) {
      studioVersion = mStudioProps.optString(PROP_STUDIOVERSION, null);
      requiredProtocol = mStudioProps.getString(PROP_PROTOCOL);
    }
    
    // Check if user should be using a different version of studio
    if (mStudioProps != null && studioVersion != null && null == redirectUrl && studioVersion.length() > 0) {
      String path = pRequest.getRequestURI();
      String queryString = pRequest.getQueryString();
      
      // TODO: Alter these with new NGUI redirects
      if (!path.equals("/studio/activate.html") && !path.equals("/studio/reset.html") && !path.equals("/studio/store")) {
        
        if (studioVersionCookie == null || loginCookie != null) {
          // User using wrong version (and not logged in), set cookie and redirect to /
          if (studioVersion.equals("beta")) {
            addVersionCookie(pResponse, "3");
            String redirect = requiredProtocol + "://" + serverName + "/";
            
            if (queryString != null) {
              redirect = redirect + "/?" + queryString;
            }
            redirectUrl = redirect;
            proceed = false;
          } else if (studioVersion.isEmpty()) {
            addVersionCookie(pResponse, "2");
          }
        }

      }
    }
    
    if (proceed) {
      String selectedProtocol = resolveScheme(pRequest);

      // Ensure that we are using the correct protocol (https by default);
      if (!requiredProtocol.equals(selectedProtocol)) {
        String redirect = requiredProtocol + "://" + serverName;
        redirectUrl = redirect;
        log.info("requiredProtocol=" + requiredProtocol + ", selectedProtocol=" + selectedProtocol);
        proceed = false;
      }
    }

    if (null != redirectUrl) {
      // If a redirect url has been set, send the redirect.
      log.info("Redirecting to " + redirectUrl);
      mInput = JSONObject.fromObject(pRequest.getParameterMap());
      pResponse.sendRedirect(redirectUrl);
    } else {
      setNoCacheHeaders(pResponse);
      String csrfHash = generateCsrfHash();
      addCsrfCookie(pResponse, csrfHash);
      if (null != mStudioProps) {
        mStudioProps.put("csrf", csrfHash);
      }
      pRequest.setAttribute("csrftoken", csrfHash);
      setXFrameOptionHeaders(pResponse);
      mInput = JSONObject.fromObject(pRequest.getParameterMap());
      log.debug(mInput.toString(2));
    }

    return proceed;
  }

  private JSONObject getCoreProps(HttpServletRequest pRequest, HttpServletResponse pResponse, String scheme, Cookie loginCookie,
          String referer) throws IOException, ClientProtocolException {
    boolean proceed;
    JSONObject myCoreProps = null;
    // TODO: if studio is deployed to separate box than millicore, need to look at this logic again
    String host = "127.0.0.1";// pRequest.getLocalName();
    String endpoint = PROPS_ENDPOINT;
    int port = pRequest.getLocalPort();
    String uri = scheme + "://" + host + ((port < 0 || port == 80 || port == 443) ? "" : ":" + port) + endpoint;

    // call studio props endpoint to get all properties
    HttpClient client = new DefaultHttpClient();
    HttpPost post = new HttpPost(uri);
    post.setHeader("referer", referer);

    // Send requestor's cookie if available
    if (null != loginCookie) {
      post.addHeader("Cookie", "feedhenry=" + loginCookie.getValue());
    }

    HttpResponse response = client.execute(post);
    int statusCode = response.getStatusLine().getStatusCode();

    HttpEntity resEntity = response.getEntity();
    StringBuilder sb = new StringBuilder();

    if (resEntity != null) {
      InputStreamReader iSR = new InputStreamReader(resEntity.getContent());
      BufferedReader br = new BufferedReader(iSR);
      String read = br.readLine();
      try {
        while (read != null) {
          sb.append(read);
          read = br.readLine();
        }
      } catch (Throwable e) {
        proceed = false;
        log.error("Got exception parsing data from props endpoint", e);
          pResponse.sendError(500, "Error connecting to server. Please try again later.");
      } finally {
        br.close();
        iSR.close();
      }
    }

    if (200 == statusCode) {
      myCoreProps = JSONObject.fromObject(sb.toString());
      log.debug("mCoreProps: " + myCoreProps.toString(2));
    } else {
      log.error("Got Exception from props endpoint (" + statusCode + ")\nResponse Body:\n" + sb.toString());
    }
    return myCoreProps;
  }

  /**
   * Used by App Store to re-direct to https
   * @param  pRequest  [description]
   * @param  pResponse [description]
   * @return           [description]
   * @throws Exception [description]
   */
  public boolean checkStoreProtocol(HttpServletRequest pRequest, HttpServletResponse pResponse) throws Exception {
    log.debug("check store protocol");
    String serverName = pRequest.getServerName();
    String selectedProtocol = resolveScheme(pRequest);
    String referer = selectedProtocol + "://" + serverName;

    String requiredProtocol = getRequiredProtocol(pRequest, pResponse, "http", referer);

    // Ensure that we are using the correct protocol (https by default);
    if (!requiredProtocol.equals(selectedProtocol)) {
      String redirect = requiredProtocol + "://" + serverName + "/store/";
      log.info("requiredProtocol=" + requiredProtocol + ", selectedProtocol=" + selectedProtocol + " - redirecting to: " + redirect);
      pResponse.sendRedirect(redirect);
      return false;
    }
    return true;
  }

  private String getRequiredProtocol(HttpServletRequest pRequest, HttpServletResponse pResponse, String scheme, String referer) throws ClientProtocolException, IOException {
    String requiredProtocol = "https"; // default to secure

    JSONObject myCoreProps = getCoreProps(pRequest, pResponse, scheme, null, referer);
    if (null != myCoreProps) {
      if (!"error".equals(myCoreProps.optString("status"))) {
        JSONObject studioProps = myCoreProps.getJSONObject("clientProps");
        if (studioProps != null) {
          requiredProtocol = studioProps.getString(PROP_PROTOCOL);
          log.debug("requiredProtocol=" + requiredProtocol + " - set by sutdio property: " + PROP_PROTOCOL);
        }
      }
    }
    return requiredProtocol;
  }

  public String getPageName() {
    return mPageName;
  }

  private String generateCsrfHash(){
    String salt = "UhwwE5p-d7ssOpcmq";
    return DigestUtils.md5Hex(new Date().toString() + salt);
  }
  
  public boolean canProceed(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageName) throws Exception {
    boolean canProceed = false;

    // If we have a userProps object, we're logged in
    this.mLoggedIn = mUserProps != null;

    String reqUri = pRequest.getRequestURI();
    String reqPage = pRequest.getParameter("a");
    boolean checkPage = DEFAULT_URL.equals(reqUri);

    if (checkPage) {
      if (null != reqPage && mAllowedActionRequest.contains(reqPage)) {
        if (mLoggedIn) {
          if (reqPage.equals(IDE_LANDING)) {
            reqPage = getPropPage(pRequest, pResponse, PROP_AUTHLANDINGPAGES);
          } else if (reqPage.equals(IDE_LOGIN)) {
            reqPage = getPropPage(pRequest, pResponse, PROP_LOGINPAGES);
          }
          dispatchTo(pRequest, pResponse, reqPage);
        } else {
          if (reqPage.equals(IDE_LOGIN)) {
            dispatchToProp(pRequest, pResponse, PROP_LOGINPAGES);
          } else {
            dispatchToProp(pRequest, pResponse, PROP_NOAUTHLANDINGPAGES);
          }
        }
      } else {
        if (mLoggedIn) {
          dispatchToProp(pRequest, pResponse, PROP_AUTHLANDINGPAGES);
        } else {
          dispatchToProp(pRequest, pResponse, PROP_NOAUTHLANDINGPAGES);
        }
      }
    } else {
      if (mLoggedIn) {
        canProceed = true;
      } else {
        JSONArray noAuthFiles = JSONArray.fromObject(mStudioProps.getString(PROP_NOAUTHLANDINGPAGES).split(","));
        JSONArray loginFiles = JSONArray.fromObject(mStudioProps.getString(PROP_LOGINPAGES).split(","));

        if (noAuthFiles.contains(pPageName) || loginFiles.contains(pPageName)) {
          canProceed = true;
        } else {
          String requiredProtocol = mStudioProps.getString(PROP_PROTOCOL);
          String serverName = pRequest.getServerName();
          String noAuthFile = mStudioProps.getString(PROP_LOGINPAGE);
          String redirect = requiredProtocol + "://" + serverName + "?a=" + noAuthFile;

          pResponse.sendRedirect(redirect);
        }
      }
    }

    return canProceed;
  }

  public boolean isLoggedIn() {
    return mLoggedIn;
  }

  public String getEmail() {
    String email = mUserProps.optString("email");
    return email;
  }

  public String getAccountType() {
    String accountType = mUserProps.optString("accountType");
    return accountType;
  }

  private void dispatchToProp(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageProp) throws Exception {
    String dispatchFile = getPropPage(pRequest, pResponse, pPageProp);

    dispatchTo(pRequest, pResponse, dispatchFile);
  }

  private String getPropPage(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageProp) {
    String dispatchFile = null;

    String dispatchFileProp = mStudioProps.getString(pPageProp);

    String[] dispatchFiles = dispatchFileProp.split(",");
    // don't check array has at least one entry to ensure property is always set
    // i.e. if property isn't set, exception is thrown
    int pageNum = 0;
    int numPages = dispatchFiles.length;

    // only kick in page num logic if we have more than 1 possible page
    if (numPages > 1) {
      // check if we have a cookie that dictates page to use
      Cookie landing = getCookie(STUDIO_PAGES_GROUP_COOKIE, pRequest);
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
      // generate a page num based on num pages and `ts

      String dispatchFileWeight = mStudioProps.optString(pPageProp + "Weights");

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
    log.debug("Dispatching to: pPageName=" + pPageName + " pPageUrl=" + pPageUrl);

    if (null != pPageUrl) {
      pRequest.setAttribute("result", "fail");
      pRequest.setAttribute("orginal_URI", pRequest.getRequestURI());
      pRequest.setAttribute("Domain", mDomain);
      pRequest.setAttribute("StudioProps", mStudioProps);
      pRequest.setAttribute("Theme", mTheme);
      RequestDispatcher dispatcher = pRequest.getRequestDispatcher(pPageUrl);
      dispatcher.forward(pRequest, pResponse);
    } else {
      pResponse.sendError(404);
    }
  }

  private String resolveUrl(String pDomain, String pPage) throws Exception {
    String resolvedUrl = null;
    String themeName = getThemeName();

    if (!pPage.endsWith(".html")) {
      pPage += ".html";
    }

    String themeUrl = StudioBean.IDE_THEMES_FILE.replace("%theme%", themeName).replace("%file%", pPage);
    String defaultUrl = StudioBean.IDE_DEFAULT_FILE.replace("%file%", pPage);

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

  /**
  * Set headers for clickjacking defense - see https://www.owasp.org/index.php/Clickjacking_Defense_Cheat_Sheet
  */
  private void setXFrameOptionHeaders(HttpServletResponse pResponse){
    pResponse.setHeader("X-Frame-Options", "DENY");
  }

  public List<String> getThemes() throws Exception {
    JSONArray themes = mStudioProps.getJSONArray("themes");
    
    // Theme override?
    if (mInput.has("theme")) {
      JSONArray theme_override = mInput.getJSONArray("theme");

      if (null != theme_override) {
        themes.add(theme_override.get(0));
      }
    }

    return themes;
  }

  public String getThemeName() throws Exception {
    return mStudioProps.getString("theme");
  }

  public String getLanguage() {
    return "en";
  }

  public String getLoginDomain() {
    return mDomain;
  }

  public JSONObject getProps() throws Exception {
    return mStudioProps;
  }

  public JSONObject getUserProps() throws Exception {
    return mUserProps;
  }

  public String getUserPropsJsonString() throws Exception {
    return mUserProps != null ? mUserProps.toString() : "{}";
  }

  public String getProperty(String pPropName) throws Exception {
    return mStudioProps.optString(pPropName);
  }
  
  public String getEnvironment() throws Exception {
    return mVersionBean.getEnvironment();
  }

  public Map<String, String> getDocsLinks() throws Exception {
    Map<String, String> links = new HashMap<String, String>();

    String linksStr = getProperty(PROP_LANDINGDOCS);

    try {
      JSONObject linksJson = JSONObject.fromObject(linksStr);
      Iterator it = linksJson.keys();
      while (it.hasNext()) {
        String key = (String) it.next();
        String val = linksJson.getString(key);
        links.put(key, val);
      }
    } catch (Exception e) {
      log.error("Exception parsing docs links" + ((linksStr != null) ? linksStr : "(null)"), e);
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
    String out = "/studio/static/" + pPath;
    return out;
  }

  public String getThemeStaticAssetPath(String pPath) throws Exception {
    String fullPath = "themes/" + getThemeName() + pPath;
    String staticPath = getStaticAssetPath(fullPath);
    return staticPath;
  }
  
  public String getFrameworkScripts() throws Exception {
    if(isResourceExists(FRAMEWORK_SCRIPTS_ALL_PATH)){
      return convertToScriptTag(getStaticAssetPath(FRAMEWORK_SCRIPTS_ALL_PATH));
    } else {
      if(null == mFrameworkScripts){
        String frameworkScriptList = loadResourceAsText(FRAMEWORK_SCRIPTS_LIST_PATH);
        String[] parts = frameworkScriptList.split(";");
        mFrameworkScripts = Arrays.asList(parts);
      }
      return convertToTag(mFrameworkScripts, "script");
    }
  }
  
  public String getIdeScripts() throws Exception {
    if(isResourceExists(IDE_SCRIPT_ALL_PATH)){
      return convertToScriptTag(getStaticAssetPath(IDE_SCRIPT_ALL_PATH));
    } else {
      if(null == mIdeScripts){
        String ideScriptList = loadResourceAsText(IDE_SCRIPTS_LIST_PATH);
        String[] parts = ideScriptList.split(";");
        mIdeScripts = Arrays.asList(parts);
      }
      return convertToTag(mIdeScripts, "script");
    }
  }
  
  public String getIdeStyles() throws Exception {
    if(isResourceExists(IDE_STYLE_ALL_PATH)){
      return convertToCssTag(getStaticAssetPath(IDE_STYLE_ALL_PATH));
    } else {
      if( null == mIdeStyles){
        String ideStyleList = loadResourceAsText(IDE_STYLE_LIST_PATH);
        String[] parts = ideStyleList.split(";");
        mIdeStyles = Arrays.asList(parts);
      }
      return convertToTag(mIdeStyles, "style");
    }
  }
  
  public String loadResourceAsText(String pResourcePath) throws Exception {
    StringBuffer text = new StringBuffer();
    InputStream in = this.getClass().getResourceAsStream(pResourcePath);
    BufferedReader reader = new BufferedReader(new InputStreamReader(in));
    String line = null;
    while( (line = reader.readLine()) != null){
      text.append(line + ";");
    }
    reader.close();
    return text.toString();
  }

  public String getNotificationMessage() throws Exception {
    String notificationMessage = mStudioProps.optString("notificationMessage", "");
    return notificationMessage;
  }

  public String getNotificationSeverity() throws Exception {
    String notificationSeverity = mStudioProps.optString("notificationSeverity", "warning");
    return notificationSeverity;
  }
  
  private boolean isResourceExists(String pResource){
    URL uri = this.getClass().getClassLoader().getResource("../../static/" + pResource);
    if(null == uri){
      return false;
    }
    File f = new File(uri.getPath());
    return f.exists();
  }
  
  private String convertToTag(List<String> pScripts, String pTagType) throws Exception{
    StringBuffer value = new StringBuffer();
    for(int i=0;i<pScripts.size();i++){
      String path = pScripts.get(i);
      if(!"".equals(path)){
        path = getStaticAssetPath(path);
        String tagString = "";
        if("script".equalsIgnoreCase(pTagType)){
          tagString = convertToScriptTag(path);
        } else if("style".equalsIgnoreCase(pTagType)){
          tagString = convertToCssTag(path);
        }
        value.append(tagString);
        value.append("\n");
      }
    }
    return value.toString();
  }
  
  private String convertToScriptTag(String pPath){
    return "<script type=\"text/javascript\" src=\""+pPath+"\"></script>";
  }
  
  private String convertToCssTag(String pPath){
    return "<link rel=\"stylesheet\" href=\""+pPath+"\"/>";
  }
  
  /**
   * Check if the currently logged in user has a specified permission
   */
  
  public boolean hasPermission(String permission) {
  System.out.println("user perm check : " + permission );
    if(null != mUserProps && mUserProps.has("permissions")){
      //System.out.println("user perms" + mUserProps.getJSONArray("permissions"));
      return mUserProps.getJSONArray("permissions").contains(permission);
    }
    return false;
  }

  public void error(Exception pException) throws Exception {
    log.error("error called", pException);
  }

  private Cookie getCookie(String pName, HttpServletRequest pRequest) {
    Cookie cookie = null;
    if (null != pName) {
      Cookie[] cookies = pRequest.getCookies();
      if (null != cookies) {
        for (int cI = 0; cI < cookies.length; cI++) {
          if (pName.equals(cookies[cI].getName())) {
            cookie = cookies[cI];
          }
        }
      }
    }
    return cookie;
  }
  
  private String resolveScheme( HttpServletRequest pReq ) {
    String scheme = pReq.getScheme();
    for( Iterator hI = sSchemeHeaders.iterator(); hI.hasNext(); ) {
      String ph = (String) hI.next();
      String v  = pReq.getHeader( ph );
      if( null != ph && null != v && !"".equals( v ) ) {
        scheme = v;
        log.info("Got scheme header '" + ph + "' with value '" + v + "'");
      }
    }

    return scheme;
  }

  public boolean showStudioVersionOption() throws Exception {
    String showStudioVersionOptionVal = getProperty(PROP_STUDIOVERSIONOPTION);
    boolean showStudioVersionOption = showStudioVersionOptionVal != null && showStudioVersionOptionVal.equals("true");

    return showStudioVersionOption;
  }

  public boolean showCordovaVersionSelection(String pDest) throws Exception {
    String propName = "destination." + pDest + ".cordova.version-selection";
    if(!getProps().has(propName)){
      propName = "destination." + "default" + ".cordova.version-selection";
    }
    return getProperty(propName).equals("true");
  }
  
  private void addVersionCookie(HttpServletResponse response, String value) {
    int expires = (3600 * 1000 * 24 * 365 * 10);
    addCookie(response, "feedhenry_v", value, false, expires);
  }
  
  private void addCsrfCookie(HttpServletResponse response, String value) {
    addCookie(response, "scrf", value, true, 0);
  }
  
  /**
   * Why?
   * 
   * TLDR; Servlet API < 3.0 don't support HttpOnly cookie flag, so we need to setHeader() instead
   * 
   * This helper lets you safely add multiple cookies
   * 
   * @param response
   * @param key
   * @param value
   * @param httpOnly
   * @param expires
   */
  private void addCookie(HttpServletResponse response, String key, String value, boolean httpOnly, int expires) {
    log.info("addCookie(). Key: " + key + ", value: " + value + ", httpOnly: " + httpOnly + ", expires: " + expires);

    String cookieSet = key + "=" + value + ";";
    if (expires > 0) {
      Date expdate= new Date();
      expdate.setTime (expdate.getTime() + expires);
      DateFormat df = new SimpleDateFormat("dd MMM yyyy kk:mm:ss z");
      df.setTimeZone(TimeZone.getTimeZone("GMT"));
      String cookieExpires = " expires=" + df.format(expdate) + ";";
      cookieSet += cookieExpires;
    }
    
    if (httpOnly) {
      cookieSet += " HttpOnly;";
    }
    
    response.addHeader("Set-Cookie", cookieSet);
  }
  
  private Cookie getVersionCookie(HttpServletRequest request) {
    return getCookie("feedhenry_v", request);
  }
}

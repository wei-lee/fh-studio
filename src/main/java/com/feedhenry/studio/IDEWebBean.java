package com.feedhenry.studio;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.JSONSerializer;
import net.sf.json.util.JSONStringer;
import net.sf.json.util.JSONUtils;

public class IDEWebBean {
  
  // studio props endpoint
  private static final String PROPS_ENDPOINT = "/box/srv/1.1/ide/<domain>/props/list";
  
  

  public static final String DEFAULT_URL = "/studio/";
  public static final String IDE_LOGIN = "login";
  public static final String IDE_LANDING= "landing";
  public static final String IDE_INDEX = "index";
  public static final String IDE_RESET = "reset";
  public static final String IDE_ACTIVATE = "activate";
  public static final String IDE_DEFAULT_FILE = "/ide/%file%";
  public static final String IDE_THEMES_FILE = "/ide/themes/%theme%/%file%";
  
  public static final String STUDIO_PAGES_GROUP_COOKIE = "feedhenry-studio-pages-group";
  public static final String LOGIN = "studio.login";
  public static final String LOGIN_PAGES = "studio.login.pages";
  public static final String AUTH_LANDING = "studio.landing.auth";
  public static final String NOAUTH_LANDING = "studio.landing.noauth";
  public static final String AUTH_LANDING_PAGES = "studio.landing.auth.pages";
  public static final String NOAUTH_LANDING_PAGES = "studio.landing.noauth.pages";

  public static final String[] GROUP_REPORTING = new String[]{AccessManager.ROLE_ANALYTICS};
  public static final String[] GROUP_ARM = new String[]{AccessManager.ROLE_PORTALADMIN};
  public static final String[] GROUP_DEVELOPER = new String[]{AccessManager.ROLE_DEV, AccessManager.ROLE_DEVADMIN};

  public static final String THEME_DEFAULT = "default";
  public static final String THEME_ENTERPRISE = "enterprise";
  
  public static final String PROTOCOL_PROPERTY = PropertyConstants.STUDIO_NAMESPACE + PropertyConstants.PROTOCOL;

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
  private JSONObject mUC = null;

  public void init(ServletContext pServletContext) throws Exception {
    mServletContext = pServletContext;
  }

  public boolean initreq(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageName) throws Exception {
    
    String redirectUrl = null;
    boolean proceed = true;

    // Allow mDomain to be forwarded with request 
    if( null != pRequest.getAttribute("Domain") ) {
      mDomain = (String) pRequest.getAttribute("Domain");
    }

    // Allow mStudioProps to be forwarded with request 
    if( null != pRequest.getAttribute("StudioProps") ) {
      mStudioProps = (JSONObject) pRequest.getAttribute("StudioProps");
    }
    
    // Allow mTheme to be forwarded with request 
    if( null != pRequest.getAttribute("Theme") ) {
      mTheme = (String) pRequest.getAttribute("Theme");
    }
    
    // Allow for domain being passed in request
    if( null == mDomain ) {
      // call studio props endpoint to get all properties
      HttpClient client = new DefaultHttpClient();
      HttpPost post = new HttpPost("http://127.0.0.1/" + PROPS_ENDPOINT);
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
          mStudioProps = JSONObject.fromObject(sb); 
          mUC = new JSONObject();
        } finally {
          br.close();
          iSR.close();
        }
      }
      
      // TODO: Get domain from props
      mDomain = "apps";
      proceed = true;
    }
    
    if( proceed ) {
      
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

    if(null != redirectUrl ) {
      // If a redirect url has been set, send the redirect.
      pResponse.sendRedirect(redirectUrl);
    }
    else {
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
        }
        else {
          if( reqPage.equals(IDE_LOGIN) ) {
            dispatchToProp(pRequest, pResponse, LOGIN_PAGES);
          }
          else {
            dispatchToProp(pRequest, pResponse, NOAUTH_LANDING_PAGES);
          }
        }
      }
      else {
        if( mLoggedIn ) {
          dispatchToProp(pRequest, pResponse, AUTH_LANDING_PAGES);
        }
        else {
          dispatchToProp(pRequest, pResponse, NOAUTH_LANDING_PAGES);
        }
      }
    }
    else {
      if( mLoggedIn ) {
        canProceed = true;
      }
      else {
        JSONArray noAuthFiles = mStudioProps.getJSONArray(NOAUTH_LANDING_PAGES);
        JSONArray loginFiles = mStudioProps.getJSONArray(LOGIN_PAGES);        
        
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
        float dist = 1f/numPages;
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
    
    if( ! pPage.endsWith(".html") ) {
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
    return mPropsBean.buildClientProps(mDomain, mUC);
  }
  
  public String getProperty(String pPropName) throws Exception {
    return mStudioProps.get(pPropName);
  }
  
  public String getJsonProperty(String pPropName) throws Exception {
    String[] parts = pPropName.split("\\.");
    JSONObject propJson = new JSONObject();
    String propValue = mStudioProps.get(parts[0]);
    boolean isJSON = true;
    try {
      propJson = new JSONObject(propValue);
    } catch(Exception e){
      isJSON = false;
    }
    String val = propValue;
    if(parts.length > 1 && isJSON){
      try{
        for(int i=1;i<parts.length;i++){
          if(i == parts.length - 1){
            val = propJson.getString(parts[i]);
          } else {
            propJson = new JSONObject(propJson.getString(parts[i]));
          }
        }
      } catch(Exception ex){
          
      }
    }
    return val;
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
      JSONObject linksJson = new JSONObject(linksStr);
      Iterator it = linksJson.keys();
      while (it.hasNext()) {
        String key = (String) it.next();
        String val = linksJson.getString(key);
        links.put(key, val);
      }      
    }catch(Exception e) {
      Explain.add(mExplain, "Error parsing json docs property :", e.getMessage());
    }
    
    return links;
  }

  public String getInfoMessage() {
    String message = "";
    if (mInput.has("message")) {
      message = mInput.getString("message");

      if (ActivationBean.ALREADY_ACTIVATED.equals(message)) {
        message = "registration_already_activated";
      }
      if (ActivationBean.NO_SUCH_ACTIVATION.equals(message)) {
        message = "registration_no_such_activation";
      }
    }
    return message;
  }

  public String getStaticAssetPath(String pPath) throws Exception {
    String path = StpgAssetManager.insertAssetVersion(pPath, getLoginDomain());
    return path;
  }

  public String getThemeStaticAssetPath(String pPath) throws Exception {
    String fullPath = "ide/themes/" + getThemeName() + pPath;
    String staticPath = "/static/c/" + getStaticAssetPath(fullPath);
    return staticPath;    
  }
  
  public IdeUserManager getIdeUserManager() {
    return mIdeUserManager;
  }

  public void setIdeUserManager(IdeUserManager pIdeUserManager) {
    mIdeUserManager = pIdeUserManager;
  }

  /**
   * Check if the currently logged in user is in the specified group
   */
  public boolean inGroup(String[] groups) throws Exception {
    boolean inGroup = false;
    // Make sure we're logged in
    if (null != mUC) {

      for(int pI=0;pI<groups.length;pI++){
        String group = groups[pI];
        if( mUC.hasRole(group) ) {
          inGroup = true;
          break;
        }
      }
      
    }
    return inGroup;
  }
  
  public void addExplainError(Exception pException) {
    if( null != pException ) {
      Explain.add(mExplain, pException.getMessage());
    }
  }
  
  public String outputExplain() {
    StringBuilder sb = new StringBuilder();
    Explain.endRequest(mExplain);
    
    if( null != mExplain ) {
      sb.append("<!--\n");
      sb.append(mExplain.toJSONObject().toString(2));
      sb.append("\n!-->");
    }
    
    return sb.toString();
  }
}


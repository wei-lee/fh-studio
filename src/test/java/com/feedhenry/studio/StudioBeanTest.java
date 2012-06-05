package com.feedhenry.studio;

import junit.framework.TestCase;


public class StudioBeanTest extends TestCase {
  private StudioBean mStudioBean;
  
  protected void setUp() throws Exception {
    mStudioBean = new StudioBean();
  }
  
  protected void tearDown() throws Exception {
    mStudioBean = null;
  }
  
//  private JSONObject login(String pUser) throws Exception {
//    UserContext permset = new UserContext();
//    permset.setRole("guest");
//    
//    MockJsonContext jc = new MockJsonContext(permset);
//    
//    LoginBean login = (LoginBean) TestUtil.getBean("Login");
//    JSONObject input = new JSONObject();
//    input.put("d", "testa");
//    input.put("u", pUser + "@example.com");
//    input.put("p", "password");
//    
//    return login.doLogin(input, jc);
//  }
//  
//  public void testInitreq() throws Exception {
//    // Set up a mock request with a dev users cookie
//    MockHttpServletRequest request = createNewMockRequest();
//    MockHttpServletResponse response = new MockHttpServletResponse();
//    JSONObject loginResult = login("dev");
//    Cookie cookie = new Cookie("feedhenry", loginResult.getString("login"));
//    Cookie[] cookies = new Cookie[1];
//    cookies[0] = cookie;
//    request.setCookies(cookies);    
//    // call initreq for index.html and verify we're logged in
//    mStudioBean.initreq(request, response, StudioBean.IDE_INDEX);
//    String redirect = response.getForwardedUrl();
//    assertNull(redirect);
//    
//    
//    // Set up a mock request with no user cookie
//    request = createNewMockRequest();    
//    response = new MockHttpServletResponse();
//    request.setScheme("https");
//    // call initreq for login.html and verify we're not redirected
//    mStudioBean.initreq(request, response, StudioBean.IDE_LOGIN);
//    redirect = response.getForwardedUrl();
//    assertNull(redirect);
//  }
//
//  private MockHttpServletRequest createNewMockRequest() {
//    MockHttpServletRequest hsr = new MockHttpServletRequest();
//    hsr.setServerName("testa.feedhenry.example.com");
//    return hsr;
//  }
}

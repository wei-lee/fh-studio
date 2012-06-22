package com.feedhenry.studio;

import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class StudioServletContextListener implements ServletContextListener {
	  
  public static final Log log = LogFactory.getLog("fhstudio");
  private static final SimpleDateFormat DATEFORMAT = new SimpleDateFormat("EEE dd MMM HH:mm:ss zzz yyyy");

  @Override
  public void contextDestroyed(ServletContextEvent arg0) {
    try {
        VersionBean vb = new VersionBean();
        
        System.out.println("Stopped Studio " + vb.getVersion() + " " + DATEFORMAT.format(new Date()));
        log.info("Stopped Studio " + vb.getVersion() + " " + DATEFORMAT.format(new Date()));
    } catch (Exception e) {
      log.error("Exception getting version info", e);
      System.exit(1);
    }
  }

  @Override
  public void contextInitialized(ServletContextEvent arg0) {
    try {
      ServerInit.doInit();

      VersionBean vb = new VersionBean();
      System.out.println("=============== START STUDIO BUILD INFO ================");
      System.out.println(vb.getReleaseInfo().toString(2));
      System.out.println("================ END STUDIO BUILD INFO =================");
      
      log.info("Started Studio " + vb.getVersion() + " " + DATEFORMAT.format(new Date()));
      System.out.println("Started Studio " + vb.getVersion() + " " + DATEFORMAT.format(new Date()));
    } catch (Exception e) {
      log.error("Exception starting", e);
      System.exit(1);
    }
  }

}

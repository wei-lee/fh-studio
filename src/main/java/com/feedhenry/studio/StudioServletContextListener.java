package com.feedhenry.studio;

import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class StudioServletContextListener implements ServletContextListener {
  
  private static final SimpleDateFormat format = new SimpleDateFormat("EEE dd MMM HH:mm:ss zzz yyyy");

  @Override
  public void contextDestroyed(ServletContextEvent arg0) {
    try {
      System.out.println("===============STUDIO STOPPING================");
      System.out.println(format.format(new Date()));
      System.out.println("=============================================");
    } catch (Exception e) {
      System.out.println(e);
      e.printStackTrace();
      System.exit(1);
    }
  }

  @Override
  public void contextInitialized(ServletContextEvent arg0) {
    try {
      VersionBean vb = new VersionBean();
      System.out.println("===============STUDIO STARTING================");
      System.out.println(format.format(new Date()));
      System.out.println(vb.getReleaseInfo().toString(2));
      System.out.println("==============================================");
    } catch (Exception e) {
      System.out.println(e);
      e.printStackTrace();
      System.exit(1);
    }
  }

}

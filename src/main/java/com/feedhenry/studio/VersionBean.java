package com.feedhenry.studio;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import net.sf.json.JSONObject;

public class VersionBean {

  private static final String GIT_FILE = "/git-info.txt";
  private static final String GIT_BRANCH_INFO_FILE = "/git-branch-info.txt";
  private static final String VERSION_FILE = "/VERSION.txt";
  private static final String ENV_FILE = "/ENV.txt";

  private String release = null;
//  private String node = null;
  private String gitRevision = null;
  private String gitBranchName = null;
  private String version = null;
  private JSONObject versionInfo = null;
  private String environment = null;
  
  public JSONObject getReleaseInfo() throws Exception{
    readReleaseInfo();
    return versionInfo;
  }
  
  public String getEnvironment() throws Exception{
    if( null == environment ) {
      InputStream is = getFileFromClasspath(ENV_FILE);
      if(null == is) {
        environment = "dev";
      } else {
        BufferedReader br = new BufferedReader( new InputStreamReader( is));
    
        String line = null;
        while((line = br.readLine()) != null) {
          environment = line.trim();
        }
      }
    }
    
    return environment;
  }
  
  public String getGitVersion() throws Exception {
    if( null == gitRevision ) {
      InputStream is = getFileFromClasspath(GIT_FILE);

      if(null == is) {
        return "error: Unable to determine version number";
      }
      else {
        BufferedReader br = new BufferedReader( new InputStreamReader( is));

        String line = null;
        while((line = br.readLine()) != null) {
          gitRevision = line.trim();
        }
        
        return gitRevision;
      }
    }
    return gitRevision;
  }

  public String getGitBranchName() throws Exception {
    if( null == gitBranchName ) {
      InputStream git_branch_is = getFileFromClasspath(GIT_BRANCH_INFO_FILE);
      if(null == git_branch_is) {
        versionInfo.put("error", "Unable to determine git_branch");
      } else {
        BufferedReader br = new BufferedReader(new InputStreamReader(git_branch_is));

        String line = null;
        while((line = br.readLine()) != null) {
          gitBranchName = line.trim();
        }
        
        return gitBranchName;
      }
    }
    return gitBranchName;
  }
  
  public String getVersion() throws Exception {
    if( null == version ) {
      InputStream is = getFileFromClasspath(VERSION_FILE);

      if(null == is) {
        return "error: Unable to determine version number";
      }
      else {
        BufferedReader br = new BufferedReader( new InputStreamReader( is));

        String line = null;
        while((line = br.readLine()) != null) {
          version = line.trim();
        }
        
        return version;
      }
    }
    return version;
  }
  
  public String getRelease() throws Exception {
    if( null == release ) {
      readReleaseInfo();      
    }
    return release;
  }
  
  private void readReleaseInfo() throws Exception {
    
    versionInfo = new JSONObject();
    InputStream is = getFileFromClasspath(GIT_FILE);

    if(null == is) {
      versionInfo.put("error", "Unable to determine version number");
    }
    else {
      BufferedReader br = new BufferedReader( new InputStreamReader( is));

      String line = null;
      while((line = br.readLine()) != null) {
        gitRevision = line.trim();
      }
      
      versionInfo.put("Studio Git revision", gitRevision);
    }

    InputStream git_branch_is = getFileFromClasspath(GIT_BRANCH_INFO_FILE);
    if(null == git_branch_is) {
      versionInfo.put("error", "Unable to determine git_branch");
    } else {
      BufferedReader br = new BufferedReader(new InputStreamReader(git_branch_is));

      String line = null;
      while((line = br.readLine()) != null) {
        gitBranchName = line.trim();
      }
      
      versionInfo.put("Studio Git Branch", gitBranchName);
    }

    release = getVersion();
    //node = ServerInit.resolveNode();
    versionInfo.put("Release", release);
    versionInfo.put("Environment", getEnvironment());
  }

  private InputStream getFileFromClasspath(String gitFile) {
    return this.getClass().getResourceAsStream(gitFile);
  }
}

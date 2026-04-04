@echo off
setlocal
set "MAVEN_PROJECTBASEDIR=%~dp0"
set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"

set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.10"

"%JAVA_HOME%\bin\java.exe" -Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR% -classpath %WRAPPER_JAR% org.apache.maven.wrapper.MavenWrapperMain %*

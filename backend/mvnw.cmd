@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.2.0
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars:
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a key stroke before ending
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@IF "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@setlocal

set ERROR_CODE=0

@REM To isolate internal variables from possible poaching by other scripts
setlocal

@REM ==== START VALIDATION ====
if not "%JAVA_HOME%" == "" goto OkJHome

for %%i in (java.exe) do set "JAVACMD=%%~$PATH:i"
if not "%JAVACMD%" == "" goto Check_and_Run

echo.
echo Error: JAVA_HOME is not defined elective and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto error

:OkJHome
set "JAVACMD=%JAVA_HOME%\bin\java.exe"

:Check_and_Run
if exist "%JAVACMD%" goto Run_Wrapper

echo.
echo Error: JAVA_HOME is set to an invalid directory.
echo JAVA_HOME = "%JAVA_HOME%"
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.
echo.
goto error

:Run_Wrapper
set WRAPPER_JAR="%~dp0.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_PROPERTIES="%~dp0.mvn\wrapper\maven-wrapper.properties"
set MAVEN_HOME="%~dp0.mvn\wrapper\dists\maven"

if exist %WRAPPER_JAR% goto Wrapper_Jar_Exists

@REM If the jar is not there, we have to download it.
set DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
for /f "tokens=2 delims==" %%i in ('findstr /i "wrapperUrl" %WRAPPER_PROPERTIES%') do set DOWNLOAD_URL="%%i"

echo.
echo Downloading Maven Wrapper...
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%DOWNLOAD_URL%', '%WRAPPER_JAR%') }"
if ERRORLEVEL 1 goto error

:Wrapper_Jar_Exists
:Wrapper_Jar_Exists
for %%i in ("%~dp0.") do set "MAVEN_PROJECTBASEDIR=%%~fi"
"%JAVACMD%" %MAVEN_OPTS% -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" -classpath %WRAPPER_JAR% org.apache.maven.wrapper.MavenWrapperMain %*
if ERRORLEVEL 1 goto error

goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

if not "%MAVEN_BATCH_PAUSE%" == "on" goto mainEnd

:mainEnd
if "%OS%"=="Windows_NT" @endlocal
if "%OS%"=="WIN32" @endlocal

exit /b %ERROR_CODE%

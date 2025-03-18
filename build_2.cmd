cd %~dp0

findstr . _error_.txt>nul && goto BUILD-FAIL

echo "success" >> build_result.txt

del /S /Q "C:\Program Files\Apache Software Foundation\Tomcat 7.0\webapps\UTP"
if not exist "C:\Program Files\Apache Software Foundation\Tomcat 7.0\webapps\UTP" (
	mkdir "C:\Program Files\Apache Software Foundation\Tomcat 7.0\webapps\UTP"
)

xcopy target\UTP /E "C:\Program Files\Apache Software Foundation\Tomcat 7.0\webapps\UTP" || goto BUILD-FAIL 


del /S /Q %NPJ_ROOT_PATH%\Test\component_test\UtpServer\testobject
if not exist %NPJ_ROOT_PATH%\Test\component_test\UtpServer\testobject\UTP (
	mkdir %NPJ_ROOT_PATH%\Test\component_test\UtpServer\testobject\UTP
)

xcopy target\UTP /E %NPJ_ROOT_PATH%\Test\component_test\UtpServer\testobject\UTP || goto BUILD-FAIL 




del _error_.txt
del _tmp_build_out
endlocal & (
set BUILD_RESULT=1
set BUILD_ERR_LOG=
)
goto :eof

REM -- handle build error
:BUILD-FAIL
echo "failed" >>build_result.txt
set BUILD_RESULT=0
set BUILD_ERR_LOG=%~dp0\_error_.txt
endlocal & (
set BUILD_RESULT=0
set BUILD_ERR_LOG=%~dp0\_error_.txt
)
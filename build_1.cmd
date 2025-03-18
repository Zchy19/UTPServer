cd %~dp0
if exist build_result.txt (
  del build_result.txt
) 
if exist _tmp_build_out.txt (
  del _tmp_build_out.txt
) 

if exist _error_.txt (
  del _error_.txt
) 

echo "UTPServer build start." >> build_result.txt
mvn package
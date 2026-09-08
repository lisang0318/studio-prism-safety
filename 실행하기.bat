@echo off
chcp 65001 > nul
title [스튜디오프리즘 안전관리 시스템]
cd /d "C:\안전관리"
node server_runner.js
pause
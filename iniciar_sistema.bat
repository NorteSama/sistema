@echo off
REM Script para iniciar el sistema de inventario (backend y frontend)

start cmd /k "cd backend && npm start"
start cmd /k "cd frontend && npm start"

echo El sistema se está iniciando...
echo Abre tu navegador en http://localhost:3000
pause 
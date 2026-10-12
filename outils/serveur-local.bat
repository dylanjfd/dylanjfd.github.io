@echo off
rem Portfolio BTS SIO - lance le serveur local (http://localhost:8000) et ouvre le navigateur.
rem Fermer cette fenetre pour arreter le serveur.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serveur-local.ps1" %*
pause


rem $env:PYTHONPATH="E:\programs\satisfactory_wikitool\backend"
SET PYTHONPATH=E:\programs\satisfactory_wikitool\backend

flask db init
flask db migrate -m "Initial migration."
flask db upgrade
flask --debug run

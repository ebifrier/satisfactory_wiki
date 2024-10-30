
rem $env:PYTHONPATH="E:\programs\satisfactory_wikitool"
SET PYTHONPATH=E:\programs\satisfactory_wikitool

flask db init
flask db migrate -m "Initial migration."
flask db upgrade
flask --debug run

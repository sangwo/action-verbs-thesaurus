.PHONY: clean

venv: requirements.txt
	virtualenv -p python3 venv
	venv/bin/pip install -r requirements.txt

run: venv
	FLASK_APP=action_verbs.py venv/bin/flask run

clean:
	rm -rf venv

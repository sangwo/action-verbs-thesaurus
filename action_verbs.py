from flask import Flask
app = Flask(__name__)
import requests
from flask import render_template, request, jsonify, json

import os
THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))

# read api key from a file
api_key_file = os.path.join(THIS_FOLDER, "api_key.txt")
f = open(api_key_file, "r")
api_key = json.loads(f.read())["api_key"]
f.close()

API_URL = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/"

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/search", methods=["GET"])
def search():
    word = request.args.get("search")
    url = API_URL + word + "?key=" + api_key
    r = requests.get(url)
    return jsonify(r.content)

@app.route("/actionverbs", methods=["GET"])
def action_verbs():
    verb_list_file = os.path.join(THIS_FOLDER, "action_verb_list.json")
    f = open(verb_list_file, "r")
    text = f.read()
    f.close()
    return text

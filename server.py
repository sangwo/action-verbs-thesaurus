from flask import Flask
app = Flask(__name__)
import requests
from flask import render_template, request, jsonify, json

API_URL = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/"
f = open("api_key.txt", "r")
api_key = json.loads(f.read())["api_key"]
f.close()

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
    f = open("action_verb_list.json", "r")
    text = f.read()
    f.close()
    return text

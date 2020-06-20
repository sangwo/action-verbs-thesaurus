from flask import Flask
app = Flask(__name__)
import requests, sqlite3, time
from flask import render_template, request, jsonify, json, g

import os
THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))

# read api key from a file
api_key_file = os.path.join(THIS_FOLDER, "api_key.txt")
f = open(api_key_file, "r")
api_key = json.loads(f.read())["api_key"]
f.close()

DATABASE = os.path.join(THIS_FOLDER, "database.db")
NUM_REQUESTS_PER_DAY = 100

API_URL = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/"

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route("/", methods=["GET"])
def index():
    db = get_db()
    cursor = db.cursor()

    # delete old (1 day) entries
    today_year = int(time.strftime("%Y"))
    today_month = int(time.strftime("%m"))
    today_day = int(time.strftime("%d"))
    today = time.mktime(time.struct_time((today_year, today_month, today_day, 0, 0, 0, 0, 0, -1)))
    cursor.execute("DELETE FROM requests WHERE timestamp - ? < 0", (today,))
    db.commit()

    return render_template("index.html")

@app.route("/requests", methods=["GET"])
def requests_over_limit():
    db = get_db()
    cursor = db.cursor()

    timestamp = int(time.time())
    ip_address = request.remote_addr

    num_requests = cursor.execute(
        "SELECT count(*) FROM requests WHERE ip_address = ?",
        (ip_address,)
    ).fetchall()[0][0]
    over_limit = num_requests >= NUM_REQUESTS_PER_DAY

    if over_limit:
        return "Too many requests. Please try again tomorrow!"
    else:
        cursor.execute(
            "INSERT INTO requests (timestamp, ip_address) VALUES (?, ?)",
            (timestamp, ip_address)
        )
        db.commit()
        return "success"

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

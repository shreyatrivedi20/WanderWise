from flask import Flask, request, jsonify, render_template
import json
import requests
from dotenv import load_dotenv
import os

load_dotenv()



app = Flask(__name__)

DATA_FILE = "data.json"

# =========================
# GEMINI CONFIG
# =========================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"gemini-2.5-flash-lite:generateContent?key={GEMINI_API_KEY}"
)
print("KEY FOUND:", GEMINI_API_KEY is not None)

# =========================
# FILE HELPERS
# =========================

def read_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def write_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


# =========================
# PAGES
# =========================

@app.route("/")
def index():
    return render_template("index.html")


# =========================
# TRIPS API
# =========================

@app.route("/api/trips", methods=["GET"])
def get_trips():
    return jsonify(read_data())


@app.route("/api/trips", methods=["POST"])
def create_trip():
    data = read_data()

    body = request.get_json()

    new_trip = {
        "id": "trip_" + str(len(data["trips"]) + 1),
        "name": body["name"],
        "budget": body["budget"],
        "destination": body.get("destination", ""),
        "dates": body.get("dates", ""),
        "expenses": []
    }

    data["trips"].append(new_trip)

    write_data(data)

    return jsonify(new_trip), 201


# =========================
# EXPENSES API
# =========================

@app.route("/api/expenses", methods=["POST"])
def add_expense():

    data = read_data()
    body = request.get_json()

    for trip in data["trips"]:

        if trip["id"] == body["trip_id"]:

            new_id = (
                1
                if len(trip["expenses"]) == 0
                else trip["expenses"][-1]["id"] + 1
            )

            new_expense = {
                "id": new_id,
                "name": body["name"],
                "amount": body["amount"],
                "category": body["category"],
                "time": body.get("time", "")
            }

            trip["expenses"].append(new_expense)

            write_data(data)

            return jsonify(new_expense), 201

    return jsonify({"error": "Trip not found"}), 404


@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):

    data = read_data()

    for trip in data["trips"]:

        for expense in trip["expenses"]:

            if expense["id"] == expense_id:

                trip["expenses"].remove(expense)

                write_data(data)

                return jsonify({"deleted": True})

    return jsonify({"error": "Expense not found"}), 404


# =========================
# GEMINI API
# =========================

@app.route("/api/gemini", methods=["POST"])
def gemini():

    body = request.get_json()

    prompt = body.get("prompt", "")

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }

    try:

        response = requests.post(
            GEMINI_URL,
            json=payload,
            headers={
                "Content-Type": "application/json"
            }
        )

        data = response.json()

        print("Gemini Response:")
        print(data)

        return jsonify(data)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# =========================
# RUN APP
# =========================

if __name__ == "__main__":
    app.run(debug=True)
import os
from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from functools import wraps
from datetime import date
from dotenv import load_dotenv

load_dotenv()  
app = Flask(__name__)
app.secret_key = os.environ["SECRET_KEY"]

bcrypt = Bcrypt(app)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])


# DB connection
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "user": os.environ["DB_USER"],
    "password": os.environ["DB_PASSWORD"],
    "database": os.environ.get("DB_NAME", "job_tracker"),
}


def get_db():
    return mysql.connector.connect(**DB_CONFIG)

# Auth helper
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Not authenticated"}), 401
        return f(*args, **kwargs)
    return wrapper

# AUTH ROUTES
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    conn = None
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (username, email, hashed_pw),
        )
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Error as e:
        if e.errno == 1062:  # duplicate entry
            return jsonify({"error": "Username or email already exists"}), 409
        return jsonify({"error": "Registration failed", "detail": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    conn = None
    try:
        conn = get_db()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()

        if not user or not bcrypt.check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid username or password"}), 401

        session["user_id"] = user["id"]
        session["username"] = user["username"]

        return jsonify({
            "message": "Login successful",
            "user": {"id": user["id"], "username": user["username"], "email": user["email"]}
        }), 200
    except Error as e:
        return jsonify({"error": "Login failed", "detail": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route("/api/logout", methods=["GET"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200


@app.route("/api/me", methods=["GET"])
@login_required
def me():
    return jsonify({
        "id": session["user_id"],
        "username": session["username"],
    }), 200


# APPLICATIONS ROUTES (all protected)
@app.route("/api/applications", methods=["GET"])
@login_required
def get_applications():
    conn = None
    try:
        conn = get_db()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT * FROM applications WHERE user_id = %s ORDER BY applied_on DESC",
            (session["user_id"],),
        )
        rows = cur.fetchall()
        for r in rows:
            if isinstance(r.get("applied_on"), date):
                r["applied_on"] = r["applied_on"].isoformat()
            if r.get("updated_at"):
                r["updated_at"] = r["updated_at"].isoformat()
        return jsonify(rows), 200
    except Error as e:
        return jsonify({"error": "Failed to fetch applications", "detail": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route("/api/applications", methods=["POST"])
@login_required
def add_application():
    data = request.get_json() or {}
    company = data.get("company")
    role = data.get("role")
    applied_on = data.get("applied_on")

    if not company or not role or not applied_on:
        return jsonify({"error": "company, role and applied_on are required"}), 400

    status = data.get("status", "Applied")
    location = data.get("location")
    job_url = data.get("job_url")
    notes = data.get("notes")

    conn = None
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO applications
               (user_id, company, role, status, applied_on, location, job_url, notes)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (session["user_id"], company, role, status, applied_on, location, job_url, notes),
        )
        conn.commit()
        return jsonify({"message": "Application added", "id": cur.lastrowid}), 201
    except Error as e:
        return jsonify({"error": "Failed to add application", "detail": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route("/api/applications/<int:app_id>", methods=["PUT"])
@login_required
def update_application(app_id):
    data = request.get_json() or {}
    fields = ["company", "role", "status", "applied_on", "location", "job_url", "notes"]
    updates = {f: data[f] for f in fields if f in data}

    if not updates:
        return jsonify({"error": "No fields to update"}), 400

    set_clause = ", ".join(f"{f} = %s" for f in updates)
    values = list(updates.values()) + [app_id, session["user_id"]]

    conn = None
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE applications SET {set_clause} WHERE id = %s AND user_id = %s",
            values,
        )
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "Application not found"}), 404
        return jsonify({"message": "Application updated"}), 200
    except Error as e:
        return jsonify({"error": "Failed to update application", "detail": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route("/api/applications/<int:app_id>", methods=["DELETE"])
@login_required
def delete_application(app_id):
    conn = None
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM applications WHERE id = %s AND user_id = %s",
            (app_id, session["user_id"]),
        )
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "Application not found"}), 404
        return jsonify({"message": "Application deleted"}), 200
    except Error as e:
        return jsonify({"error": "Failed to delete application", "detail": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route("/api/applications/stats", methods=["GET"])
@login_required
def stats():
    conn = None
    try:
        conn = get_db()
        cur = conn.cursor(dictionary=True)

        cur.execute(
            "SELECT COUNT(*) AS total FROM applications WHERE user_id = %s",
            (session["user_id"],),
        )
        total = cur.fetchone()["total"]

        cur.execute(
            """SELECT status, COUNT(*) AS count
               FROM applications WHERE user_id = %s
               GROUP BY status""",
            (session["user_id"],),
        )
        status_rows = cur.fetchall()

        statuses = ["Applied", "Shortlisted", "Interview Scheduled", "Offer Received", "Rejected"]
        by_status = {s: 0 for s in statuses}
        for row in status_rows:
            by_status[row["status"]] = row["count"]

        cur.execute(
            """SELECT * FROM applications WHERE user_id = %s
               ORDER BY applied_on DESC LIMIT 5""",
            (session["user_id"],),
        )
        latest = cur.fetchall()
        for r in latest:
            if isinstance(r.get("applied_on"), date):
                r["applied_on"] = r["applied_on"].isoformat()
            if r.get("updated_at"):
                r["updated_at"] = r["updated_at"].isoformat()

        return jsonify({
            "total": total,
            "by_status": by_status,
            "latest": latest,
        }), 200
    except Error as e:
        return jsonify({"error": "Failed to fetch stats", "detail": str(e)}), 500
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
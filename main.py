from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from keuangan_pribadi import keuangan_real as kr
from keuangan_pribadi import dashboard_keuangan_real as dkr
from chatbot_app import parse_keuangan_dari_teks, rekomendasi_hemat
import os

app = Flask(__name__, static_folder=".", static_url_path="/")
CORS(app)

# ==========================================
# API ENDPOINTS (Catatan Keuangan)
# ==========================================

@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    try:
        return jsonify(kr.get_semua_transaksi())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/transactions", methods=["POST"])
def add_transaction():
    try:
        data = request.json
        if "teks" in data:
            parsed = parse_keuangan_dari_teks(data["teks"])
            if "error" in parsed:
                return jsonify({"error": parsed["error"]}), 400
            trans = kr.tambah_transaksi(
                parsed["jenis"], parsed["jumlah"], parsed["kategori"], parsed.get("deskripsi", "")
            )
            return jsonify(trans)
        else:
            trans = kr.tambah_transaksi(
                data.get("jenis", "pengeluaran"),
                data.get("jumlah", 0),
                data.get("kategori", "lainnya"),
                data.get("deskripsi", "")
            )
            return jsonify(trans)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/transactions/<int:id>", methods=["DELETE"])
def delete_transaction(id):
    try:
        kr.hapus_transaksi(id)
        return jsonify({"status": "deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    try:
        return jsonify({
            "ringkasan": dkr.get_ringkasan(),
            "kategori": dkr.get_kategori_breakdown(),
            "prediksi": dkr.prediksi_arus_kas(7)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/rekomendasi", methods=["GET"])
def get_rekomendasi():
    try:
        trans = kr.get_semua_transaksi()
        return jsonify({"saran": rekomendasi_hemat(trans)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# API ENDPOINTS (Catatan Pribadi - Notes)
# ==========================================

notes_db = []  # Sederhana: simpan di memori (atau bisa pakai file)
note_counter = 1

@app.route("/api/notes", methods=["GET"])
def get_notes():
    return jsonify(notes_db)

@app.route("/api/notes", methods=["POST"])
def add_note():
    global note_counter
    data = request.json
    note = {
        "id": note_counter,
        "title": data.get("title", "Catatan Baru"),
        "content": data.get("content", ""),
        "date": data.get("date", ""),
        "category": data.get("category", "umum")
    }
    notes_db.append(note)
    note_counter += 1
    return jsonify(note)

@app.route("/api/notes/<int:id>", methods=["DELETE"])
def delete_note(id):
    global notes_db
    notes_db = [n for n in notes_db if n["id"] != id]
    return jsonify({"status": "deleted"})

# ==========================================
# SERVE STATIC FILES
# ==========================================

@app.route("/")
def serve_index():
    return send_from_directory(".", "index.html")

@app.route("/keuangan_pribadi/<path:path>")
def serve_keuangan(path):
    return send_from_directory("keuangan_pribadi", path)

@app.route("/catatan_pribadi/<path:path>")
def serve_catatan(path):
    return send_from_directory("catatan_pribadi", path)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

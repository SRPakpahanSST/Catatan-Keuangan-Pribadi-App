from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from keuangan_pribadi import keuangan_real as kr
from keuangan_pribadi import dashboard_keuangan_real as dkr
from chatbot_app import parse_keuangan_dari_teks, rekomendasi_hemat
import os

# Inisialisasi Flask app - arahkan ke folder keuangan_pribadi
app = Flask(__name__, static_folder="keuangan_pribadi", static_url_path="/")
CORS(app)

# ==========================================
# API ENDPOINTS (sama seperti sebelumnya)
# ==========================================

@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    try:
        data = kr.get_semua_transaksi()
        return jsonify(data)
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
            # Ubah format dari frontend ke backend
            trans = kr.tambah_transaksi(
                data.get("type", "pengeluaran") if data.get("type") == "expense" else "pemasukan",
                data.get("amount", 0),
                data.get("category", "lainnya"),
                data.get("title", "")
            )
            return jsonify(trans)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/transactions/<int:id>", methods=["DELETE"])
def delete_transaction(id):
    try:
        kr.hapus_transaksi(id)
        return jsonify({"status": "deleted", "id": id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    try:
        data = {
            "ringkasan": dkr.get_ringkasan(),
            "kategori": dkr.get_kategori_breakdown(),
            "prediksi": dkr.prediksi_arus_kas(7)
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/rekomendasi", methods=["GET"])
def get_rekomendasi():
    try:
        trans = kr.get_semua_transaksi()
        saran = rekomendasi_hemat(trans)
        return jsonify({"saran": saran})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# SERVE STATIC FILES (keuangan_pribadi)
# ==========================================

@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

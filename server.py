from flask import Flask, request, jsonify ,send_file ,Response
from flask_cors import CORS 
import scripts.db_con as DBconnect
import scripts.functionals as Qr
import scripts.llm_con as llm
app = Flask(__name__)
CORS(app) 

Db_obj  = DBconnect.modify_table()
chat_obj = llm.OllamaModel()
## LOGIN page 
@app.route('/api/auth', methods=['POST'])  # Correct methods list
def auth():
    data = request.get_json()
    print(data['email'])  # Logs received JSON data in the console
    print(data['Password']) 
    print(data['user_type'])
    if Db_obj.login_auth(email = data['email'], password = data['Password'],user_type = data['user_type'] ) :
        return jsonify({"access": "True"}), 200
    else :
        return jsonify({"access": "False"}), 200
    #return jsonify({"message": "POST request sent"}), 200  # Corrected respons



## To generate Qr code for patient and doctors
@app.route('/generate/qr', methods=['GET'])
def qr_gen():
    email = request.args.get("email")
    passwrd = request.args.get("key")
    data = Db_obj.details_extract(email = email , passwrd = passwrd)
    img = Qr.qr_generate(data)
    return send_file(img, mimetype='image/png')


# details passer 
@app.route('/asset/doctors', methods=['POST'])
def doctor_asset():
    data = Db_obj.doctor_json()
    print(data)
    return Response(data, mimetype='application/json')

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST'])
def chat_bot():
    try:
        data = request.get_json()
        if not data or "contents" not in data:
            return jsonify({"error": "Missing 'contents' field"}), 400
        
        return jsonify({"response": f"Received: {data['contents']}"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Return JSON on error



if __name__ == '__main__':
    app.run(debug=True)

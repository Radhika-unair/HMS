from flask import Flask, request, jsonify ,send_file ,Response ,make_response
from flask_cors import CORS 
import scripts.db_con as DBconnect
import scripts.functionals as Qr
import scripts.llm_con as llm
app = Flask(__name__)
CORS(app, origins="http://localhost:5173") 

Db_obj  = DBconnect.modify_table()
chat_obj = llm.OllamaModel()
## LOGIN page 
@app.route('/auth/login', methods=['POST'])  # Correct methods list
def auth():
    data = request.get_json()
    print(data['email'])  # Logs received JSON data in the console
    print(data['password']) 
    print(data['user_type'])
    result = Db_obj.login_auth(email = data['email'], password = data['password'],user_type = data['user_type'] )
    if result["status"] :
        return jsonify({
            "id":str(result["id"]),
            "name":result["name"],
            "access": "True"}), 200
    else :
        return jsonify({"access": "False"}), 200
    #return jsonify({"message": "POST request sent"}), 200  # Corrected respons
@app.route("/auth/signup", methods =["POST"],)
def signup():
    data = request.get_json()
    #{'email': 'fghgf@gma', 'password': 'gg', 'user_type': 'patient', 'name': 'csd'}
    result = Db_obj.signup_db(email = data['email'],password = data['password'],user_type = data['user_type'], name=data['name'])
    print(data)
    if result[0] == True:

        return jsonify({"access": "True",
                        "name":result[1],
                        "id":str(result[3])
                        }), 200
    else:
        return jsonify({"access": "False"}), 200



## To generate Qr code for patient and doctors
@app.route('/generate/qr', methods=['GET'])
def qr_gen():
    email = request.args.get("email")
    id = request.args.get("key")
    user_type = request.args.get("type")
    data = Db_obj.details_extract(email = email , id = id , user_type = user_type)
    img = Qr.qr_generate(data)
    return send_file(img, mimetype='image/png')


# details passer 
@app.route('/asset/doctors', methods=['POST','GET'])
def doctor_asset():
    data = Db_obj.doctor_json()
    #print(data)  # Debugging - Check if data is fresh
    response = make_response(data)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response



@app.route('/chat', methods=['POST'])
def chat_bot():
    try:
        data = request.get_json()
        print(data)
        if not data or "contents" not in data:
            return jsonify({"error": "Missing 'contents' field"}), 400
        
        return jsonify({"response": f"Received: {data['contents']}"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Return JSON on error

@app.route('/image_file', methods=['GET'])
def image_file():
    fl_name = request.args.get("file")
    user = request.args.get("usr")
    img = Qr.img_gen(fl_name,user)
    print(img)
    return send_file(img, mimetype='image/png')

@app.route('/detail/register', methods=['POST'])
def register():
    data = request.get_json()
    print(data)
    if Db_obj.detial_reg(data):
        return jsonify({'status': "true"}) ,200
    else:
        return jsonify({'status': "false"}) ,200
if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True)

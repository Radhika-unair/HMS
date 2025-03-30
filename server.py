from flask import Flask, request, jsonify ,send_file ,Response ,make_response
from flask_cors import CORS 
import scripts.db_con as DBconnect
import scripts.functionals as Qr
import scripts.llm_con as llm
import logging
import bcrypt
#import scripts.doctormod as Doc_mod


def hash_password(password: str) -> bytes:
    # Generate a salt
    salt = bcrypt.gensalt()
    # Hash the password
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='server.log'
)
app = Flask(__name__)
CORS(app, origins="http://localhost:5173") 

Db_obj  = DBconnect.modify_table()
chat_obj = llm.OllamaModel()
#doc_obj = Doc_mod.doctor_func()
## LOGIN page 

@app.errorhandler(500)
def handle_500(error):
    logging.error(f"Server error: {error}")
    return {'status': 'error', 'message': 'Internal server error'}, 500

@app.errorhandler(Exception)
def handle_exception(error):
    logging.error(f"Unhandled exception: {error}")
    return {'status': 'error', 'message': str(error)}, 500

@app.route('/auth/login', methods=['POST'])  # Correct methods list
def auth():
    data = request.get_json()
    #print(data['email'])  # Logs received JSON data in the console
    #print(data['password']) 
    #print(data['user_type'])
    print("real password :", data['password'])
    

    result = Db_obj.login_auth(email = data['email'], password = data['password'] ,user_type = data['user_type'] )
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
    pass_wrd = hash_password(data['password'])
    #{'email': 'fghgf@gma', 'password': 'gg', 'user_type': 'patient', 'name': 'csd'}
    result = Db_obj.signup_db(email = data['email'],password = data['password'] ,user_type = data['user_type'], name=data['name'],hash_password = pass_wrd)
    #print(data)
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
        #print(data)
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
    #print(img)
    return send_file(img, mimetype='image/png')

@app.route('/detail/register', methods=['POST'])
def register():
    data = request.get_json()
    #print(data)
    if Db_obj.detial_reg(data):
        return jsonify({'status': "true"}) ,200
    else:
        return jsonify({'status': "false"}) ,200
    



@app.route('/doc_dash', methods=['POST'])
def doctor_dash():
    id = request.get_json("id")
    id_dat = id['id']
    data = Db_obj.dashboard(id_dat)
    print(data)
    if data['status'] =="Fail":
        return jsonify({'status': "Fail",
                     "totalAppointments": 0,
                     "appointmentCompletionRate":0,
                     "pending":0,
                     "refer_appoint":0,
                     "Prescriptions":0
                     })
    else:
        return jsonify({'status': data["status"],
                     "totalAppointments": data["total_appoint"],
                     "appointmentCompletionRate":data["Completion Rate"],
                     "pending":data["pending"],
                     "refer_appoint":data["refer_appoint"],
                     "Prescriptions":data["Prescriptions"]
                     })
@app.route("/app/data", methods=["GET"])
def app_data():
    try:
        id = request.args.get("doctorId")
        #print(data)
    
        print(id)
        data = Db_obj.get_appoint_data(id)
        #print(data)
        return data
    
    except Exception as e:
        print(e)
        return jsonify({"status": "fail"}), 500  # Return JSON on error'''
    #return jsonify({"status": "success"}),200

@app.route("/set/appointments", methods=["POST"])
def set_app():
    data = request.get_json()
    print(data)
    result = Db_obj.book_appointments(data)
    return result ,200

@app.route("/appointments/scheduled", methods=["POST"])
def scheduled_app():
    data = request.get_json()
    print(data)
    result = Db_obj.schedule_appointments(data)
    return result, 200

@app.route("/generate/ticket", methods=["POST"])
def generate_ticket():
    data = request.get_json()
    print(data)
    result = Qr.create_patient_ticket(
        patient_id=data['patientId'],
        patient_name=data['patient_name'],
        doctor_name=data['doctor_name'],
        department=data['department'],
        appointment_date=data['appointment_date'],
        appointment_id=data['appointment_id'],
    )
    print(result)
    return result, 200

@app.route("/appointment/cancel", methods=["POST"])
def app_cancel():
    data = request.get_json()
    print(data)
    result = Db_obj.cancel_appointment(data)
    return jsonify(result), 200

@app.route("/prescription/set", methods=["POST"])
def check_app_prescription():
    data = request.get_json()
    print(data)
    result = Db_obj.add_prescription(data)
    return jsonify(result) , 200

@app.route("/doc/block", methods=["POST"])
def block_date():
    data = request.get_json()
    print(data)
    result = Db_obj.block_date(data)
    print(data)
    return result , 200
@app.route("/doc/fetch/blockdate", methods=["POST"])
def fetch_block_date():
    data = request.get_json()
    result = Db_obj.get_block_date(data)
    print(result)
    return jsonify(result), 200 

if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True)

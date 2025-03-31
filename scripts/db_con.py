import mysql.connector
import json
import base64
import bcrypt
import datetime as datetime
from datetime import timedelta
class modify_table:
    def __init__(self):
        with open("config\database.json","r") as f:
            self.data = json.loads(f.read())
            self.host = self.data["host"]
            self.user = self.data["user"]
            self.password = self.data["password"]
            self.port = self.data["port"]
            self.database = self.data["database"]
        self.connect = mysql.connector.connect(
            host=self.host,
            user=self.user,
            password=self.password,
            port=self.port,
            database=self.database
        )
        print("connected")
    def get_db_connection(self):
        return mysql.connector.connect(
            host=self.host,
            user=self.user,
            password=self.password,
            database=self.database,
            autocommit=True)
    
    def login_auth(self, email, password, user_type):
        print("password : ",password)
        try:
            if not self.connect.is_connected():
                self.connect.reconnect()
            self.connect.commit()
            cursor = self.connect.cursor(buffered=True)

            # Query to fetch serial_id along with user existence check
            query = "SELECT serial_number,Name, hashid FROM users WHERE email = %s AND usertype = %s"

            cursor.execute(query, (email, user_type))
            result = cursor.fetchone()
            #print("returned  :",result[2])

            if result:
                stored_hash_bytes = result[2].encode('utf-8')
                print("hash sucsess")
                if  bcrypt.checkpw(password.encode('utf-8'), stored_hash_bytes):
                    serial_id = result[0]
                    print(f"User exists. Serial ID: {serial_id}")
                    if user_type =="doctor":
                        sec_query = """SELECT doctor_id
                                FROM doctor 
                                WHERE serial_number = %s;"""
                        cursor.execute(sec_query, (serial_id,))
                      # Ensure tuple formatting
                        details = cursor.fetchone()
                        id = details[0]
                    if user_type == "patient":
                        sec_query = """SELECT patient_id 
                                 FROM patient 
                                WHERE serial_number = %s;"""
                        cursor.execute(sec_query, (serial_id,))
                        # Ensure tuple formatting
                        details = cursor.fetchone()
                        id = details[0]
                    return {"status": True, "id": id,"name":result[1]}
                else:
                    print("Incorrect password.")
                    return {"status": False, "id": None}
            else:
                print("User does not exist.")
                return {"status": False, "id": None}
        except mysql.connector.Error as err:
            print(f"login Error: {err}")
            return {"status": False, "id": None}
        finally:
            cursor.close()

    def details_extract(self, email: str,id , user_type):
        retrn_data = {}
    
        try:
            if not self.connect.is_connected():
                self.connect.reconnect()
            cursor = self.connect.cursor(buffered=True)

            # Primary query to fetch user details
            #query = """SELECT usertype, serial_number, Name
            ##       FROM users 
            #       WHERE email = %s AND password = %s;"""
            #cursor.execute(query, (email, passwrd))
            #result = cursor.fetchone()

            #if not result:
            #    print("No user found")
            #    return {}  # Return empty dict if no user is found

            #usertype, serial_number, username = result

            if user_type == "doctor":
                sec_query = """SELECT serial_number, name, specialization, phone_number 
                               FROM doctor 
                               WHERE doctor_id, = %s;"""
                cursor.execute(sec_query, (id,))  # Ensure tuple formatting
                details = cursor.fetchone()

                if details:
                    retrn_data = {
                        "usertype": user_type,
                        "doctor_id": id,
                        "name": details[1],
                        
                        "specialization": details[2],
                        "phone_number": details[3],
                        "email": email,
                        
                    }
                    
 

            elif user_type == "patient":
                sec_query = """SELECT serial_number, name, date_of_birth, gender, address, phone_number 
                               FROM patient 
                               WHERE patient_id = %s;"""
                cursor.execute(sec_query, (id,))
                details = cursor.fetchone()

                if details:
                    retrn_data = {
                        "usertype": id,
                        "patient_id":id,
                        "first_name": details[1],
                        "date_of_birth": details[2],
                        "gender": details[3],
                        "address": details[4],
                        "phone_number": details[5],
                        "email": email,
                        
                    }
                   


            return retrn_data  # Returns extracted data if found, otherwise empty dict

        except Exception as e:
            print(f"detail extract Error: {e}")
            return {}

        finally:
            if cursor:
                cursor.close()  # Close cursor to prevent memory leaks


    def doctor_json(self):
        details_ = []
        connect = self.get_db_connection()
        try:
            
            cursor = connect.cursor(buffered=True)

        # 🔄 Force the latest data
            connect.commit()  # Ensures any pending transactions are applied

            query = "SELECT * FROM doctor"
            cursor.execute(query)
            result = cursor.fetchall()

            for items in result:
                doc_obj = {
                    "_id": str(items[0]),
                    "name": items[2],
                    "image": f"{items[11]}.png",
                    "speciality": items[3],
                    "degree": items[6],
                    "experience": items[5],
                    "about": items[7],
                    "fees": str(items[8]),
                    "address": {
                        "line1": items[9],
                        "line2": items[10]
                    }
                }
                details_.append(doc_obj)

            details_ = json.dumps(details_, indent=4)

            #print("Fetched from DB:", details_)  # 🔍 Debugging print
            return details_

        except Exception as e:
            print("doctor json Error:", e)
            return json.dumps({"status": "Fail"})

        finally:
            try:
                cursor.close()
                connect.close()
            except:
                pass
    def signup_db(self, email, password, user_type, name,hash_password):
        try:
            if not self.connect.is_connected():
                self.connect.reconnect()
            cursor = self.connect.cursor(buffered=True)
            email_query = "SELECT COUNT(*) FROM users WHERE email = %s"
            cursor.execute(email_query, (email,))
            count = cursor.fetchone()[0]
            if count > 0:
                print("Email already exists. Signup failed.")
                return [False]
            if user_type == "doctor":
                name = f"Dr. {name}"
            # Insert user into users table
            query = """INSERT INTO users (Name, password, usertype, email,hashid) 
                       VALUES (%s, %s, %s, %s,%s);"""
            cursor.execute(query, (name, password, user_type, email,hash_password))
            self.connect.commit()

            # Fetch serial_number for the newly inserted user
            query = """SELECT serial_number FROM users WHERE email = %s AND hashid = %s"""
            cursor.execute(query, (email, hash_password))
            serial_no = cursor.fetchone()

            if serial_no:
                serial_no = serial_no[0]  # Extract value from tuple

                # Insert into corresponding table based on user type
                if user_type.lower() == "doctor":
                    query = """INSERT INTO doctor (serial_number, name) 
                               VALUES (%s, %s);"""
                    cursor.execute(query, (serial_no, name))
                    query = """SELECT doctor_id FROM doctor WHERE serial_number = %s"""
                    cursor.execute(query, (serial_no,))
                    id = cursor.fetchone()

                elif user_type.lower() == "patient":
                    query = """INSERT INTO patient (serial_number, name) 
                               VALUES (%s, %s);"""
                    cursor.execute(query, (serial_no, name))
                    query = """SELECT patient_id FROM patient WHERE serial_number = %s"""
                    cursor.execute(query,(serial_no,))
                    id = cursor.fetchone()
                self.connect.commit()
                

            else:
                print("Error: Serial number not found for the user")
            return [True,name,email,id[0],user_type] 
        except Exception as e:
            print("signup  Error:", e)
            return [False]
    
        finally:
            cursor.close()  # Ensure cursor is always closed

    def detial_reg(self,data):
        if not self.connect.is_connected():
                self.connect.reconnect()
        self.connect.commit()
        try:
            cursor = self.connect.cursor(buffered=True)
            if data["usertype"] == "doctor":
                query = """UPDATE doctor 
                               SET about = %s , specialization = %s, phone_number = %s, add_line1 = %s, add_line2 = %s, fees = %s 
                               WHERE doctor_id = %s;"""
                cursor.execute(query, (data["bio"],data["speciality"], data["phone_number"], data["address_line1"], data["address_line2"], data["fees"], data["userId"]))
            if data["usertype"] == "patient":
                em = str(data["emergencyContact"])+"\t"+str(data["emergencyPhone"])
                query = """UPDATE patient 
                               SET date_of_birth = %s, gender = %s, address = %s, phone_number = %s ,bloodgroup = %s, Allergies = %s , Emergency = %s
                               WHERE patient_id = %s;"""
                cursor.execute(query, (data["dateOfBirth"],data["gender"], data["address"], data["phone"], data["bloodGroup"], data["allergies"], em,data["userId"]))
            self.connect.commit()
            return True
        except Exception as e:
            print("detail_reg Error",e)
            return False

    def dashboard(self, id):
        cursor = None
        connect = self.get_db_connection()
        self.connect.commit() 
        # ✅ Initialize cursor before using it
        try:
            
            cursor = connect.cursor(buffered=True)
             # ✅ Ensure cursor is always initialized
            
            query = """SELECT * FROM appointment WHERE Doc_id = %s AND DATE(ap_date) = CURDATE();"""
            cursor.execute(query, (id,))
            data = cursor.fetchall()
            if cursor:  # Only close if cursor was successfully initialized
                cursor.close()
                connect.close()
            #print("Appointment Details Retrieved")
            total_appoint = len(data)
            pending = sum(1 for row in data if row[4] == "pending")
            refer = sum(1 for row in data if row[6] == 1)

            completion_rate = ((total_appoint - pending) / total_appoint) if total_appoint else 0

            result = {
                "status": "True",
                "total_appoint": total_appoint,
                "Completion Rate": round(completion_rate, 2),
                "pending": int(pending),  # ✅ Avoid division errors
                "refer_appoint": refer,
                "Prescriptions": "0"
            }
            #print(result)
            return result
        except Exception as e:
            print("dashboard Error:", e)
            return {"status": "Fail"}
        finally:
            if cursor:  # Only close if cursor was successfully initialized
                cursor.close()
                connect.close()
            

    def get_appoint_data(self, id):
        cursor = None
        try:
            connect = self.get_db_connection()
            
            cursor = connect.cursor()
            self.connect.commit()
            query = """SELECT patient_id, status, ap_date, ap_id FROM appointment 
                       WHERE Doc_id = %s AND DATE(ap_date) = CURDATE();"""
            cursor.execute(query, (id,))
            appointments = cursor.fetchall()
            
            result_data = []
            for row in appointments:
                query = """SELECT name FROM patient WHERE patient_id = %s"""
                cursor.execute(query, (row[0],))
                patient_name = cursor.fetchone()

                if patient_name:
                    result_data.append({
                        "Patient Name": patient_name[0], 
                        "patient_id": row[0],
                        "app_id": row[3],
                        "Status": row[1], 
                        "Appointment Date": row[2].strftime("%Y-%m-%d"),  # Format Date
                        "Appointment Time": row[2].strftime("%I:%M %p")  # Format Time (12-hour format)
                    })
            cursor.close()
            connect.close()
            
            return json.dumps({"status": "success", "appointments": result_data}, default=str)

        except Exception as e:
            print("get appoint Error:", e)
            return json.dumps({"status": "fail", "message": str(e)})
        finally:
            if cursor:  # Only close if cursor was successfully initialized
                cursor.close()
                       
    def book_appointments(self,app_data):
        try:
            connect = self.get_db_connection()
            cursor = connect.cursor(buffered=True)
            connect.commit()
            app_date_time = f"{app_data['date']} {app_data['time']}"
            query = "SELECT block , app_limit FROM app_refer_limit WHERE doctor_id = %s"
            cursor.execute(query, (app_data['doctorId'],))
            limt_check = cursor.fetchone()
            if limt_check is not None:
                if limt_check[0]==1:
                    print("Cannot book appointment on this date and time as it is blocked")
                    return {"status": "fail", "message": "Cannot book appointment doctor is blocked"}
            query_check = "SELECT COUNT(*) FROM appointment WHERE Doc_id =%s AND DATE(ap_date) = %s"
            cursor.execute(query_check, (app_data['doctorId'],app_data['date'] ))
            
            block_check = cursor.fetchone()
            #print(block_check[0],limt_check[1])
            if (block_check and limt_check) is not None:
                if block_check[0] >= limt_check[1]+1:
                    print("Cannot book appointment on this date and time as it exceeds the maximum limit")
                    return {"status": "fail", "message": "Cannot book appointment on this date and time as it exceeds the maximum limit"}
            query_check = "SELECT COUNT(*) FROM block_date WHERE doc_id =%s AND date = %s"
            cursor.execute(query_check, (app_data['doctorId'], app_data['date']))
            ret_data = cursor.fetchone()[0]
            if ret_data > 0:
                print(ret_data)
                print("Cannot book appointment on this date and time as it is blocked")
                return {"status": "fail", "message": "Cannot book appointment on this date and time as it is blocked"}
            query_check = "SELECT COUNT(*) FROM appointment WHERE patient_id =%s AND Doc_id =%s AND ap_date = %s"
            cursor.execute(query_check, (app_data['userId'], app_data['doctorId'], app_date_time))

            if cursor.fetchone()[0] > 0:
                print("Already booked an appointment with this patient on this doctor on this date and time")
                return {"status": "fail", "message": "Already booked an appointment with this doctor on this date and time"}
            query = """INSERT INTO appointment (patient_id, Doc_id, ap_date, status, refer) 
                       VALUES (%s, %s, %s, %s, %s);"""
            
            cursor.execute(query,(app_data['userId'],app_data['doctorId'], app_date_time ,"pending",0))
            connect.commit()
            ap_id = cursor.lastrowid
            cursor.close()
            connect.commit()
            return {"status": "success", "appointmentId": ap_id}
        except Exception as e:
            print("book_appointments Error:", e)
            return {"status": "fail"}
        finally:
            if cursor:
                cursor.close()
                connect.close()
        

    def schedule_appointments(self,data):
        try:
            connect = self.get_db_connection()
            cursor = connect.cursor(buffered=True)
            connect.commit()
            query = "SELECT * FROM appointment WHERE patient_id = %s"
            cursor.execute(query, (data["userId"],))
            result = cursor.fetchall()
            query = "SELECT name,specialization,fees FROM doctor WHERE doctor_id = %s"
            jsonlist = []
            if result:
                for row in result:
                    cursor.execute(query, (row[1],))
                    doc_det = cursor.fetchone()
                    
                    app_dat = {
                        "appointmentId": row[0],
                        "Doctor":doc_det[0],
                        "specialization": doc_det[1],
                        "fees": int(doc_det[2]),
                        "doctorId": row[1],
                        "patientId": row[2],
                        "booked_date": row[3].strftime("%Y-%m-%d %H:%M:%S"),
                        "time": row[5].strftime("%Y-%m-%d %H:%M:%S"),
                        "status": row[4],
                        "refer": row[6]
                    }
                    jsonlist.append(app_dat)
                    #print(row)
                connect.commit()
                return json.dumps({"status": "success", "appointments":jsonlist
                                   })
            return json.dumps({"status": "fail"})
        except Exception as e:
            print("schedule_appointments Error:", e)
            return json.dumps({"status": "fail"})
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def cancel_appointment(self ,data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = "SELECT COUNT(*) FROM appointment WHERE ap_id = %s AND Doc_id = %s AND patient_id=%s"
            cursor.execute(query, (data["appointmentId"], data["doctorid"], data["patientId"]))
            result = cursor.fetchone()
            if result[0] == 1:
                query = "DELETE FROM appointment WHERE ap_id = %s"
                cursor.execute(query, (data["appointmentId"],))
                connect.commit()
                return {"status": "success"}
            return {"status": "fail"}
        except Exception as e:
            print("cancel_appointment Error:", e)
            return {"status": "fail"}
        finally:
            if cursor:
                connect.commit()
                cursor.close()
                connect.close()

    def add_prescription(self,data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """INSERT INTO prescription (patient_id, doctor_id, app_id, pres_detials)
                    VALUES (%s, %s, %s, %s);"""
            
            cursor.execute(query,(
                    int(data['patientid']),
                    int(data['doctorid']),
                    int(data['appointmentId']),
                    str(data[ 'prescription']),
            ))
            query = "UPDATE appointment SET status = 'complete' WHERE ap_id = %s;"
            cursor.execute(query, (int(data['appointmentId']),))
            connect.commit()
            return {"status": "success"}
        except Exception as e:
            print("add_prescription Error: ",e)
            return {"status": "fail"}
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def block_date(self , data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """INSERT INTO block_date (doc_id,date) 
                    VALUES(%s,%s)"""
            cursor.execute(query,(
                    int(data['doctorId']),
                    str(data['date']),
            ))
            connect.commit()
            return {"status": "success"}
            
        except Exception as e:
            print("block_date Error: ",e)
            return {"status": "fail"}
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def get_block_date(self,data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """SELECT date FROM block_date WHERE doc_id = %s AND date >= CURDATE();"""
            cursor.execute(query,( int(data['doctorId']),))
            result = cursor.fetchall()
            
            block_dates = [row[0].strftime("%Y-%m-%d") for row in result]
            
            connect.commit()
            return {"status": "success" , "result":block_dates}
            
        except Exception as e:
            print("block_date Error: ",e)
            return {"status": "fail"}
        finally:
            if cursor:
                cursor.close()
                connect.close()

##################################################################################################

#    Admin panel setings
            

    def admin_auth(self,data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """SELECT serial_number , hashid FROM users WHERE email = %s AND usertype = 'admin' """
            cursor.execute(query,( data["email"],))
            result = cursor.fetchone()
            if result:
                stored_hash_bytes = result[1].encode('utf-8')
                
                if  bcrypt.checkpw(data["password"].encode('utf-8'), stored_hash_bytes):
                    print("hash sucsess succeeded")
                    return {"status": "success","id":result[0]}
            return {"status": "fail","message":"Admin Not Exist" }    
            
        except Exception as e:
            print("admin_auth Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()



####   Doctor adding to refer list who are not in the list 

    def limitation_doctors_not_set(self):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """SELECT  doctor_id , name , specialization
                            FROM doctor
                            WHERE doctor_id NOT IN (SELECT doctor_id FROM app_refer_limit);"""
            cursor.execute(query,)
            result = cursor.fetchall()
            if result:
                data =  [{"id": row[0],"name":row[1],"specialization":row[2]} for row in result]
                return {"status": "success","data":data}
            return {"status": "fail","message":"no result is fetched" }
            
        except Exception as e:
            print("limitation_doctors_not_set Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def limitations_doctors_add(self,data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """INSERT INTO app_refer_limit (doctor_id , refer_limit , app_limit) VALUES (%s , %s, %s);"""
            cursor.execute(query,( data["doctor_id"],data["refer_limit"],data["appointment_limit"],))
            connect.commit()
            return {"status": "success","message":"Doctor Added Successfully" }
            
        except Exception as e:
            print("limitations_doctors_add Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()


    def limitations_doctors_get(self):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """SELECT doctor_id , refer_limit ,app_limit , block FROM app_refer_limit"""
            cursor.execute(query,)
            result = cursor.fetchall()
            if result:
                data = []
                for row in result:
                    query = "SELECT name , specialization FROM doctor WHERE doctor_id = %s"
                    cursor.execute(query,(row[0],))
                    doc_det = cursor.fetchone()
                    data.append({"id": row[0],"name":doc_det[0],"specialization":doc_det[1],"refer_limit":row[1],"appointment_limit":row[2] , "block":row[3]})
                return {"status": "success","data":data, "message":"Doctor Added Successfully" }
            
            return {"status": "fail","message":"no doctor retreived" }
        except Exception as e:
            print("limitations_doctors_add Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()
    
    def limitations_doctors_update(self , data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """UPDATE app_refer_limit SET refer_limit = %s , app_limit = %s WHERE doctor_id = %s;"""
            cursor.execute(query,( data["refer_limit"],data["appointment_limit"],data["doctor_id"],))
            connect.commit()
            return {"status": "success","message":"Doctor Limit Updated Successfully" }
            
        except Exception as e:
            print("limitations_doctors_update Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def block_doctor_admin(self,data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            if data["block"]==1:
                query = """UPDATE app_refer_limit SET block = %s WHERE doctor_id = %s;"""
                cursor.execute(query,(
                    int(1),
                    int(data['doctor_id'])))
            if data["block"]==0:
                query = """UPDATE app_refer_limit SET block = %s WHERE doctor_id = %s;"""
                cursor.execute(query,(
                    int(0),
                    int(data['doctor_id'])))
            
            connect.commit()
            return {"status": "success","message":"Doctor Blocked Successfully" }
            
        except Exception as e:
            print("block_date_admin Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def referral_add(self,data):
        try:
            print(data, "in db_con reeferal_add")
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """INSERT INTO refer (from_doc , to_doc , disc , pat_id, status, p_app) VALUES (%s , %s, %s, %s ,%s,%s);"""
            cursor.execute(query,( int(data["currentdoc"]),int(data["doctor_id"]),data["description"],int(data["patient_id"]), int(0) , int(data["app_id"])))
            connect.commit()
            return {"status": "success","message":"Referral Added Successfully" }
            
        except Exception as e:
            print("referral_add Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def bed_status(self):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """SELECT bed_id , room_number FROM bed_data"""
            cursor.execute(query,)
            result = cursor.fetchall()
            if result:
                bed = []
                data = []
                for row in result:
                    #print("bed_id =", row[0])
                    bed.append({"bed_id": row[0], "room_number": row[1]})
                    query = "SELECT * FROM bed_alloc WHERE Bed_id = %s"
                    cursor.execute(query,(row[0],))
                    bed_data = cursor.fetchall()
                    #print(bed_data)
                    if bed_data:
                        for subrow in bed_data:
                            data.append(
                            {
                                "bed_id": row[0],
                                "room_number": row[1],
                                "date":subrow[3].strftime("%Y-%m-%d")

                            }
                        )
                    
                return {"status": "success","Bed_data":bed, "booked":data, "message":"Doctor Bed Status Retreived" }
            
            return {"status": "fail","message":"no doctor retreived" }
        except Exception as e:
            print("bed_status Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()
    def bed_allocate(self, data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """INSERT INTO bed_alloc (Bed_id , doc_id , pat_id , date ,status , app_id) VALUES (%s , %s, %s, %s , %s,%s);"""
            cursor.execute(query,( int(data["bed_id"]),int(data["currentdoc"]),int(data["patient_id"]), data["date"],int(0) ,data["appointment_id"]))
            connect.commit()
            return {"status": "success","message":"Bed Allocated Successfully" }
            
        except Exception as e:
            print("bed_allocate Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def admin_appointment_get_all(self):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """SELECT ap_id, Doc_id , patient_id , ap_date , status FROM appointment"""
            cursor.execute(query,)
            result = cursor.fetchall()
            if result:
                data = []
                for row in result:
                    #print(11111,row)
                    query = "SELECT name,  specialization FROM doctor WHERE doctor_id = %s"
                    id = int(row[1])
                    cursor.execute(query,(id,))
                    
                    doc_det = cursor.fetchone()
                    #print(2222,doc_det)
                    query = "SELECT name from patient where patient_id = %s"
                    id = int(row[2])
                    cursor.execute(query,(id,))
                    pat_det = cursor.fetchone()
                    #print(3333,pat_det)
                    
                    data.append({
                        "app_id": row[0],
                        "patient_id":row[2],
                        "patient_name":pat_det[0],
                        "doctor_name":doc_det[0],
                        "specialization":doc_det[1],
                        "doctor_id":row[1],
                        "date":row[3].strftime("%Y-%m-%d"),
                        "status":row[4]
                        })
                return {"status": "success","data":data}
            return {"status": "fail","message":"no result is fetched" }
            
        except Exception as e:
            print("admin_appointment_get_all Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()
    def admin_appointment_update(self, data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            demo_date = data["date"]+" 14:00:00"
            query = """UPDATE appointment SET status = %s, Doc_id = %s , ap_date = %s WHERE ap_id = %s;"""
            cursor.execute(query,( data["status"],int(data["doctor_id"]),demo_date , int(data["app_id"])))
            connect.commit()
            return {"status": "success","message":"Appointment Status Updated Successfully" }
            
        except Exception as e:
            print("admin_appointment_update Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()
    def get_all_refer_req(self):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """SELECT referid, from_doc , to_doc , disc , pat_id, status, p_app FROM refer"""
            cursor.execute(query,)
            result = cursor.fetchall()
            if result:
                data = []
                for row in result:
                    #print(11111,row)
                    query = "SELECT name,  specialization FROM doctor WHERE doctor_id = %s"
                    id = int(row[1])
                    cursor.execute(query,(id,))
                    
                    f_doc_det = cursor.fetchone()
                    query = "SELECT name,  specialization FROM doctor WHERE doctor_id = %s"
                    id = int(row[2])
                    cursor.execute(query,(id,))
                    
                    t_doc_det = cursor.fetchone()
                    #print(2222,doc_ref)
                    query = "SELECT name from patient where patient_id = %s"
                    id = int(row[4])
                    cursor.execute(query,(id,))
                    pat_det = cursor.fetchone()
                    data.append({
                        "referid": row[0],
                        "from_doc_id":row[1],
                        "to_doc_id":row[2],
                        "from_doctor":f_doc_det[0],
                        "from_specialization":f_doc_det[1],
                        "to_doctor":t_doc_det[0],
                        "to_specialization":t_doc_det[1],
                        "patient_id":row[4],
                        "patient_name":pat_det[0],
                        "description":row[3],
                        "status":int(row[5]),
                        "app_id":row[6]
    
                    })
                return {"status": "success","data":data}
            return {"status": "fail","message":"no result is fetched" }
        except Exception as e:
            print("get_all_refer_req Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()
    def accept_referal( self ,data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            today = datetime.datetime.now()
            dte = (today + timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')
            if data['status']==1:
                query = """INSERT INTO appointment (patient_id, Doc_id, ap_date, status, refer) 
                       VALUES (%s, %s, %s, %s, %s);"""
                cursor.execute(query,(data["patient_id"],data["doc_id"],dte,'pending',1))
                
                connect.commit()
                query = """UPDATE refer SET status = %s WHERE referid = %s;"""
                cursor.execute(query,('1',int(data["referid"])))
                connect.commit()
            
                return {"status": "success","message":"Referal Accepted Successfully" }
            query = """UPDATE refer SET status = %s WHERE referid = %s;"""
            cursor.execute(query,('-1',int(data["referid"])))
            connect.commit()
            return {"status": "success","message":"Referal Accepted Successfully" }
            
        except Exception as e:
            print("accept_referal Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def get_all_beds_req(self):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """SELECT * FROM bed_alloc"""
            cursor.execute(query,)
            result = cursor.fetchall()
            if result:
                data = []
                for row in result:
                    query = "SELECT name,  specialization FROM doctor WHERE doctor_id = %s"
                    cursor.execute(query,(int(row[5]),))
                    doc_det = cursor.fetchone()
                    query = "SELECT name from patient where patient_id = %s"
                    cursor.execute(query,(int(row[2]),))
                    pat_det = cursor.fetchone()
                    #print(row)
                    data.append({
                        "alloc_id":row[0],
                        "bed_id": row[1],
                        "paitent_id": row[2],
                        "patient_name": pat_det[0],
                        "doctor_name": doc_det[0],
                        "specialization": doc_det[1],
                        "date": row[3].strftime("%Y-%m-%d"),
                        "doctor_id": row[5],
                        "appointment_id": row[6],
                        "status": int(row[4])
                        })
                return {"status": "success","data":data}
            return {"status": "fail","message":"no result is fetched" }
            
        except Exception as e:
            print("get_all_beds Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def accept_bed_req(self , data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            today = datetime.datetime.now()
            
           
            query = """UPDATE bed_alloc SET status = %s WHERE alloc_id = %s;"""
            cursor.execute(query,(str(data["status"]),int(data['alloc_id']),))
            connect.commit()
            return {"status": "success","message":"Bed Allocation Accepted Successfully" }
        except Exception as e:
            print("accept_bed_req Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def get_user_details(self,data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """SELECT * FROM patient WHERE patient_id = %s"""
            cursor.execute(query,(int(data["patientId"]),))
            result = cursor.fetchone()
            #print(result)
            if result:
                data = {
                    "patient_id":result[0],
                    "name":result[2],
                    "DateOfBirth":result[3].strftime("%Y-%m-%d"),
                    "gender":result[5],
                    "address":result[5],
                    "contact":result[6],
                    "bloodGroup":result[7]
                    
                }
                return {"status": "success","data":data}
            return {"status": "fail","message":"no result is fetched" }
            
        except Exception as e:
            print("get_user_details Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def get_user_visit_history(self,data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """SELECT * FROM prescription WHERE patient_id = %s"""
            cursor.execute(query,(int(data["patientId"]),))
            result = cursor.fetchall()
            #print(result)
            if result:
                data = []
                for row in result:
                    querr= "SELECT name ,specialization FROM doctor WHERE doctor_id = %s"
                    cursor.execute(querr,(int(row[2]),))
                    doc_det = cursor.fetchone()
                    query = "SELECT name FROM patient WHERE patient_id = %s"
                    cursor.execute(query,(int(row[1]),))
                    pat_det = cursor.fetchone()
                    data.append({
                        "prescription_id":row[0],
                        "patient_id":row[1],
                        "doctor_id":row[2],
                        "doctor_name":doc_det[0],
                        "patient_name":pat_det[0],
                        "specialization":doc_det[1],
                        "prescription":row[4],
                        "date":row[5].strftime("%Y-%m-%d")
                        
                        })
                    return {"status": "success","data":data}
            return {"status": "fail", }
        except Exception as e:
            print("get_user_visit_history Error: ",e)
            return {"status": "fail","message":""}
        finally:
            if cursor:
                cursor.close()
                connect.close()

    def get_user_bed_details(self , data):
        try:
            connect = self.get_db_connection()
            connect.commit()
            cursor = connect.cursor(buffered=True)
            query = """SELECT * FROM bed_alloc WHERE pat_id = %s"""
            cursor.execute(query,(int(data["patientId"]),))
            result = cursor.fetchall()
            #print(result)
            if result:
                data = []
                for row in result:
                    #print(row)
                    query = "SELECT name,  specialization FROM doctor WHERE doctor_id = %s"
                    cursor.execute(query,(int(row[5]),))
                    doc_det = cursor.fetchone()
                    data.append({
                        "alloc_id":row[0],
                        "bed_id":row[1],
                        "patient_id":row[2],
                        "date":row[3].strftime("%Y-%m-%d"),
                        "doctor":doc_det[0],
                        "specialization": doc_det[1],
                        "appointment_id":row[6],
                        "status": row[4]
                    })
                return {"status": "success","data":data}
            return {"status": "fail","message":"no result is fetched" }
            
        except Exception as e: 
            print("get_user_bed_details Error: ",e)
            return {"status": "fail","message":e }
        finally:
            if cursor:
                cursor.close()
                connect.close()
import mysql.connector
import json
import base64

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

    def login_auth(self, email, password, user_type):
        try:
            self.connect.commit()
            cursor = self.connect.cursor()

            # Query to fetch serial_id along with user existence check
            query = "SELECT serial_id,Name FROM users WHERE email = %s AND password = %s AND usertype = %s"
            cursor.execute(query, (email, password, user_type))
            result = cursor.fetchone()

            if result:
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
                print("User does not exist.")
                return {"status": False, "id": None}
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            return {"status": False, "id": None}
        finally:
            cursor.close()

    def details_extract(self, email: str, passwrd: str):
        retrn_data = {}
    
        try:
            cursor = self.connect.cursor()

            # Primary query to fetch user details
            query = """SELECT usertype, serial_number, Name
                   FROM users 
                   WHERE email = %s AND password = %s;"""
            cursor.execute(query, (email, passwrd))
            result = cursor.fetchone()

            if not result:
                print("No user found")
                return {}  # Return empty dict if no user is found

            usertype, serial_number, username = result

            if usertype == "doctor":
                sec_query = """SELECT doctor_id, name, specialization, phone_number 
                               FROM doctor 
                               WHERE serial_number = %s;"""
                cursor.execute(sec_query, (serial_number,))  # Ensure tuple formatting
                details = cursor.fetchone()

                if details:
                    retrn_data = {
                        "usertype": usertype,
                        "doctor_id": details[0],
                        "name": details[1],
                        
                        "specialization": details[2],
                        "phone_number": details[3],
                        "email": email,
                        "username": username,
                    }
                    
 

            elif usertype == "patient":
                sec_query = """SELECT patient_id, first_name, last_name, date_of_birth, gender, address, phone_number 
                               FROM patient 
                               WHERE serial_number = %s;"""
                cursor.execute(sec_query, (serial_number,))
                details = cursor.fetchone()

                if details:
                    retrn_data = {
                        "usertype": usertype,
                        "patient_id": details[0],
                        "first_name": details[1],
                        "last_name": details[2],
                        "date_of_birth": details[3],
                        "gender": details[4],
                        "address": details[5],
                        "phone_number": details[6],
                        "email": email,
                        "username": username,
                    }
                   


            return retrn_data  # Returns extracted data if found, otherwise empty dict

        except Exception as e:
            print(f"Error: {e}")
            return {}

        finally:
            if cursor:
                cursor.close()  # Close cursor to prevent memory leaks


    def doctor_json(self):
        details_ = []
        try:
            cursor = self.connect.cursor()

        # 🔄 Force the latest data
            self.connect.commit()  # Ensures any pending transactions are applied

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

            print("Fetched from DB:", details_)  # 🔍 Debugging print
            return details_

        except Exception as e:
            print("Error:", e)
            return json.dumps({"status": "Fail"})

        finally:
            cursor.close()
    def signup_db(self, email, password, user_type, name):
        try:
            cursor = self.connect.cursor()
            if user_type == "doctor":
                name = f"Dr. {name}"
            # Insert user into users table
            query = """INSERT INTO users (Name, password, usertype, email) 
                       VALUES (%s, %s, %s, %s);"""
            cursor.execute(query, (name, password, user_type, email))
            self.connect.commit()

            # Fetch serial_number for the newly inserted user
            query = """SELECT serial_number FROM users WHERE email = %s AND password = %s"""
            cursor.execute(query, (email, password))
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
            print("Error:", e)
            return [False]
    
        finally:
            cursor.close()  # Ensure cursor is always closed

    def detial_reg(self,data):
        self.connect.commit()
        try:
            cursor = self.connect.cursor()
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
            print("Error",e)
            return False

            

#myobj = modify_table()
#myobj.doctor_json()

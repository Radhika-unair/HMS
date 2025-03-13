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

    def login_auth( self, email, password, user_type):
        try:
            cursor = self.connect.cursor()
            query = "SELECT COUNT(*) FROM users WHERE email = %s AND password = %s AND usertype = %s"
            cursor.execute(query, (email, password , user_type))
            result = cursor.fetchone()

            if result[0] > 0:
                print("User exists.")
                return True
            else:
                print("User does not exist.")
                return False
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            return False
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
                    "_id": items[0],
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

            

#myobj = modify_table()
#myobj.doctor_json()

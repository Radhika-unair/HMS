import mysql.connector
import json
import random
import string


class setup_database:
    def __init__(self , db_name):
        self.db_name = db_name
        with open("config\database.json","r") as f:
            self.data = json.loads(f.read())
            self.host = self.data["host"]
            self.user = self.data["user"]
            self.password = self.data["password"]
            self.port = self.data["port"]
            self.database = self.data["database"]
        if self.database != db_name:
            self.connect = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                port=self.port
            )
        else:
            self.connect = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                port=self.port,
                database=self.database
            )
        
    def create_database(self):
        cursor = self.connect.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.db_name}")  # change the name HMS to your on likes
        cursor.close()
        self.data["database"] = self.db_name
        with open("config\database.json","w") as f:
            json.dump(self.data, f, indent=4)
            print("updated Config file sucsessfully")
        print(f"{self.db_name}Database created successfully.")
        self.close_connection()
        self.__init__(self.db_name)


    def create_tables(self):
        cursor = self.connect.cursor()
        querys = [""" 
        CREATE TABLE IF NOT EXISTS users (
            username VARCHAR(255) NOT NULL, 
            password VARCHAR(255) NOT NULL, 
            usertype ENUM('admin', 'doctor', 'patient') NOT NULL, 
            serial_number INT NOT NULL AUTO_INCREMENT, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
            PRIMARY KEY (serial_number)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS patient (
            patient_id INT AUTO_INCREMENT PRIMARY KEY,
            serial_number INT,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            date_of_birth DATE NOT NULL,
            gender ENUM('Male', 'Female', 'Other') NOT NULL,
            address TEXT,
            phone_number VARCHAR(15),
            FOREIGN KEY (serial_number) REFERENCES users(serial_number) ON DELETE CASCADE
        );""",
        """
        CREATE TABLE IF NOT EXISTS doctor (
            doctor_id INT AUTO_INCREMENT PRIMARY KEY,
            serial_number INT,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            specialization VARCHAR(100) NOT NULL,
            phone_number VARCHAR(15),
            FOREIGN KEY (serial_number) REFERENCES users(serial_number) ON DELETE CASCADE
        );

        """

        ]
        for query in querys:
            cursor.execute(query)
        cursor.close()

    # adding data to doctor table 

    def email_gen(self):
        domains = ["gmail.com"]
        name = ''.join(random.choices(string.ascii_lowercase, k=8))
        return f"{name}@{random.choice(domains)}"

    def pass_gen(self):
        return ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    
    def add_doctors_user(self):
        with open("scripts/doc_data.json","r") as fl:
            data = json.load(fl)
        cursor = self.connect.cursor()
        query2 = """INSERT INTO users (Name,email,password,usertype)
                VALUES (%s, %s, %s, %s);"""
        try:
            for items in data:
                name = items["name"]
                email = self.email_gen()
                passwrd = self.pass_gen()
                usr = "doctor"
                print(name, email,passwrd, usr ,sep="   ")
                cursor.execute(query2,(name,email,passwrd,usr))
                
                print("executed")
        except Exception as e:
            print(e)



    def add_doctors_doctor(self):
        with open("scripts/doc_data.json","r") as fl:
            datas = json.load(fl)
        cursor = self.connect.cursor()
        query1 = """INSERT INTO doctor (serial_number, name, specialization, experience, degree, about, fees, add_line1, add_line2, phone_number, image_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """
        # adjust the value according to the user table 
        i = 68
        for data in datas:
            cursor.execute(query1,(
                i,
                data["name"],
                data["speciality"],
                data["experience"], 
                data["degree"],
                data["about"],
                int(data["fees"]), 
                data["address"]["line1"],
                data["address"]["line2"],
                int(random.randint(6000000000, 9999999999)),
                data["image"]
            ))
            i +=1
        
    def close_connection(self):
        self.connect.commit()
        self.connect.close()
        print("Connection closed.")

data_base = setup_database(db_name="HMS")
data_base.add_doctors_doctor()
data_base.close_connection()


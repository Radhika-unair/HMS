import qrcode
import io
import datetime
import base64
from PIL import Image, ImageDraw, ImageFont, ImageOps

def qr_generate(data:dict, local_save = False):
    try:
        img = qrcode.make(data)
        img_io = io.BytesIO()
        qr = img.convert("RGB") # Ensure it's in RGB format
        qr.save(img_io, format='PNG')
        if local_save :
            now = datetime.datetime.now()
            DaTym = now.strftime("%Y_%m_%d_%H_%M_%S")
            name = data["username"]
            qr.save(f"output/{name}-{DaTym}.png") 
         
        img_io.seek(0) # important to set the reader at the begning of image
        return img_io
    except Exception as e:
        print(e)
def img_gen(file_name , user = "doc"):
    img_io = io.BytesIO()
    if file_name == "None.png" and user == "doc":
        file_name = "doc.png"
    if file_name == "None.png" and user == "pat":
        file_name = "pat.png"
    try:
        with open(f"assets/{file_name}", "rb") as f:
            img_io.write(f.read())
        img_io.seek(0)
        
        return img_io
    except Exception as e:
        print(e)
        return None


import qrcode
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime

def create_patient_ticket(patient_name, patient_id, doctor_name, appointment_date, department, appointment_id):
    image_io = io.BytesIO()
    # Ticket dimensions (horizontal)
    width, height = 800, 400
    
    # Create base image with white background
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    # Draw header section
    blue = (25, 82, 159)
    header_height = 100
    draw.rectangle([(0, 0), (width, header_height)], fill=blue)
    
    # Add hospital logo
    try:
        logo = Image.open("./assets/logo.png").resize((217, 46))
        img.paste(logo, (20, 30), logo)
    except:
        draw.text((30, 30), "HOSPITAL LOGO", fill='white', font=ImageFont.load_default())
    
    # Title
    try:
        title_font = ImageFont.truetype("./assets/font/Boldonse-Regular.ttf", 36)
    except:
        title_font = ImageFont.load_default()
    draw.text((width//2 + 70, 50), "Appointment Ticket", fill='white', font=title_font, anchor='mm')
    
    # Patient details
    try:
        detail_font = ImageFont.truetype("./assets/font/Iceland-Regular.ttf", 24)
    except:
        detail_font = ImageFont.load_default()
    
    details = [
        f"Patient Name: {patient_name}",
        f"Patient ID: {patient_id}",
        f"Doctor: {doctor_name}",
        f"Department: {department}",
        f"Appointment Date: {appointment_date}"
    ]
    
    detail_x = 50
    detail_y = header_height + 40
    for i, detail in enumerate(details):
        draw.text((detail_x, detail_y + i * 35), detail, fill='black', font=detail_font)
    
    # QR Code generation
    qr_data = {
        "Patient Name": patient_name,
        "Patient ID": patient_id,
        "Doctor": doctor_name,
        "Department": department,
        "Appointment Date": appointment_date,
        "Appointment ID": appointment_id,
    }
    qr = qrcode.make(qr_data)
    qr = qr.resize((250, 250))  # Resize QR code to fit the placeholder

    # QR Code position
    qr_x = width - 300
    qr_y = height//2 - 80
    img.paste(qr, (qr_x, qr_y))

    # Generated Date and Time (above QR code)
    generated_datetime = datetime.now().strftime("Generated: %Y-%m-%d %H:%M:%S")
    try:
        small_font = ImageFont.truetype("./assets/font/Iceland-Regular.ttf", 18)
    except:
        small_font = ImageFont.load_default()
    draw.text((qr_x + 125, qr_y - 5), generated_datetime, fill='black', font=small_font, anchor='mm')
    
    # Save and show ticket
    img.save(f"./output/app/{appointment_id}-appointment_ticket.png")
    img.save(image_io,format='PNG')
    image_io.seek(0) # important to set the reader at the begning of image
    return image_io

# Example Usage


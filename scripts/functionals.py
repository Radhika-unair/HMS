import qrcode
import io
import datetime
import base64
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

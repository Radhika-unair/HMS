import qrcode
import io
import datetime
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

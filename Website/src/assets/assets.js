import appointment_img from "./appointment_img.png";
import header_img from "./header_img.png";
import group_profiles from "./group_profiles.png";
import profile_pic from "./profile_pic.png";
import contact_image from "./contact_image.png";
import about_image from "./about_image.png";
import logo from "./logo.svg";
import dropdown_icon from "./dropdown_icon.svg";
import menu_icon from "./menu_icon.svg";
import cross_icon from "./cross_icon.png";
import chats_icon from "./chats_icon.svg";
import verified_icon from "./verified_icon.svg";
import arrow_icon from "./arrow_icon.svg";
import info_icon from "./info_icon.svg";
import upload_icon from "./upload_icon.png";
import stripe_logo from "./stripe_logo.png";
import razorpay_logo from "./razorpay_logo.png";
import Dermatologist from "./Dermatologist.svg";
import Gastroenterologist from "./Gastroenterologist.svg";
import General_physician from "./General_physician.svg";
import Gynecologist from "./Gynecologist.svg";
import Neurologist from "./Neurologist.svg";
import Pediatricians from "./Pediatricians.svg";
let url = "https://87c6-2409-40f3-1003-a579-98e8-4f69-6382-2c13.ngrok-free.app";
export const assets = {
  appointment_img,
  header_img,
  group_profiles,
  logo,
  chats_icon,
  verified_icon,
  info_icon,
  profile_pic,
  arrow_icon,
  contact_image,
  about_image,
  menu_icon,
  cross_icon,
  dropdown_icon,
  upload_icon,
  stripe_logo,
  razorpay_logo,
};

export const specialityData = [
  { speciality: "General physician", image: General_physician },
  { speciality: "Gynecologist", image: Gynecologist },
  { speciality: "Dermatologist", image: Dermatologist },
  { speciality: "Pediatricians", image: Pediatricians },
  { speciality: "Neurologist", image: Neurologist },
  { speciality: "Gastroenterologist", image: Gastroenterologist },
];

// Function to fetch doctors data
export async function fetchDoctors() {
  try {
    const response = await fetch(`${url}/asset/doctors`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    // Fetch image URLs asynchronously
    return await Promise.all(
      data.map(async (doctor) => ({
        _id: doctor._id,
        name: doctor.name,
        image: await img(doctor.image), // Await image URL here
        speciality: doctor.speciality,
        degree: doctor.degree,
        experience: doctor.experience,
        about: doctor.about,
        fees: doctor.fees,
        address: {
          line1: doctor.line1,
          line2: doctor.line2,
        },
      }))
    );
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
}

async function img(doct) {
  try {
    const response = await fetch(`${url}/image_file?file=${doct}`, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    return response.url; // Return the final URL
  } catch (error) {
    console.error("Error fetching image:", error);
    return ""; // Return empty string if fetch fails
  }
}

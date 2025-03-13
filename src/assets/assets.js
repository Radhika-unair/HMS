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
import doc1 from "./doc1.png";
import doc2 from "./doc2.png";
import doc3 from "./doc3.png";
import doc4 from "./doc4.png";
import doc5 from "./doc5.png";
import doc6 from "./doc6.png";
import doc7 from "./doc7.png";
import doc8 from "./doc8.png";
import doc9 from "./doc9.png";
import doc10 from "./doc10.png";
import doc11 from "./doc11.png";
import doc12 from "./doc12.png";
import doc13 from "./doc13.png";
import doc14 from "./doc14.png";
import doc15 from "./doc15.png";
import doc16 from "./doc16.png";
import Dermatologist from "./Dermatologist.svg";
import Gastroenterologist from "./Gastroenterologist.svg";
import General_physician from "./General_physician.svg";
import Gynecologist from "./Gynecologist.svg";
import Neurologist from "./Neurologist.svg";
import Pediatricians from "./Pediatricians.svg";

const BASE_URL =
  "https://f86c-2a09-bac1-3680-470-00-1c6-d.ngrok-free.app/asset/doctors";

// DoctorsAPI class to handle all doctor-related API calls
class DoctorsAPI {
  static async fetchDoctors() {
    console.warn("�� Starting API fetch...");

    try {
      console.warn(`📡 Trying URL: ${BASE_URL}`);

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies if any
        mode: "cors", // Explicit CORS mode
        body: JSON.stringify({}),
      });

      console.warn(`📥 Response from ${BASE_URL}:`, {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        type: response.type,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error from ${BASE_URL}:`, errorText);
        throw new Error(errorText);
      }

      const responseText = await response.text();
      console.warn("📄 Raw response:", responseText);

      if (!responseText) {
        console.error("❌ Empty response received");
        throw new Error("Empty response received");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.warn("✅ Successfully parsed JSON:", data);
      } catch (e) {
        console.error("❌ JSON Parse Error:", e);
        console.error("Raw text was:", responseText);
        throw new Error("Failed to parse JSON response");
      }

      // Validate data structure
      if (!Array.isArray(data)) {
        console.error("❌ API returned non-array data:", data);
        throw new Error("API returned non-array data");
      }

      // Check if data has required fields
      const isValidData = data.every(
        (doctor) => doctor._id && doctor.name && doctor.speciality
      );

      if (!isValidData) {
        console.error("❌ API returned incomplete doctor data:", data);
        throw new Error("API returned incomplete doctor data");
      }

      console.warn("✅ Successfully fetched and validated data from", BASE_URL);
      return data;
    } catch (error) {
      console.error(`🚨 Error fetching from ${BASE_URL}:`, error);
      throw error;
    }
  }
}

// DoctorsStore class to manage doctors data state
class DoctorsStore {
  constructor(initialData) {
    this.data = [...initialData];
    this.subscribers = new Set();
    this.isLoading = false;
    this.error = null;
    this.lastUpdated = null;

    // Log initial state
    console.warn("🏥 DoctorsStore initialized with:", {
      dataLength: this.data.length,
      firstDoctor: this.data[0],
    });
  }

  async fetchAndUpdate() {
    console.warn("🔄 Starting fetchAndUpdate");
    try {
      this.isLoading = true;
      this.notifySubscribers();

      const data = await DoctorsAPI.fetchDoctors();
      console.warn("📊 Fetch result:", data);

      if (data) {
        this.data.length = 0;
        this.data.push(...data);
        this.error = null;
        this.lastUpdated = new Date();
        console.warn("✨ Store updated with new data:", {
          dataLength: this.data.length,
          firstDoctor: this.data[0],
        });
      } else {
        this.error = "Failed to fetch doctors data";
        console.error("❌ Store update failed - no data received");
      }
    } catch (error) {
      this.error = error.message;
      console.error("💥 Store update failed:", error);
    } finally {
      this.isLoading = false;
      this.notifySubscribers();
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback({
      data: this.data,
      isLoading: this.isLoading,
      error: this.error,
      lastUpdated: this.lastUpdated,
    });
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    const state = {
      data: this.data,
      isLoading: this.isLoading,
      error: this.error,
      lastUpdated: this.lastUpdated,
    };
    this.subscribers.forEach((callback) => callback(state));
  }
}

// Fallback/initial data
const fallbackDoctors = [
  {
    _id: "doc1",
    name: "Dr. Richard James",
    image: doc1,
    speciality: "General physician",
    degree: "MBBS",
    experience: "4 Years",
    about:
      "Dr. Davis has a strong commitment to delivering comprehensive medical care.",
    fees: 50,
    address: {
      line1: "17th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "doc2",
    name: "Dr. Emily Larson",
    image: doc2,
    speciality: "Gynecologist",
    degree: "MBBS",
    experience: "3 Years",
    about:
      "Dr. Davis has a strong commitment to delivering comprehensive medical care.",
    fees: 60,
    address: {
      line1: "27th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "doc3",
    name: "Dr. Sarah Patel",
    image: doc3,
    speciality: "Dermatologist",
    degree: "MBBS",
    experience: "1 Years",
    about:
      "Dr. Davis has a strong commitment to delivering comprehensive medical care.",
    fees: 30,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "doc4",
    name: "Dr. Christopher Lee",
    image: doc4,
    speciality: "Pediatricians",
    degree: "MBBS",
    experience: "2 Years",
    about:
      "Dr. Davis has a strong commitment to delivering comprehensive medical care.",
    fees: 40,
    address: {
      line1: "47th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
];

// Create the doctors store instance
const doctorsStore = new DoctorsStore(fallbackDoctors);

// Modify the initial fetch to be more visible
console.warn("🚀 Initiating initial doctors fetch...");
doctorsStore
  .fetchAndUpdate()
  .then(() => {
    console.warn("📋 Initial fetch completed");
  })
  .catch((error) => {
    console.error("💥 Initial fetch failed:", error);
  });

// Set up auto-refresh every 5 minutes
setInterval(() => {
  doctorsStore.fetchAndUpdate().catch(console.error);
}, 5 * 60 * 1000);

// Exports
export const doctors = doctorsStore.data;
export const useDoctors = (callback) => doctorsStore.subscribe(callback);
export const refreshDoctors = () => doctorsStore.fetchAndUpdate();

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
  {
    speciality: "General physician",
    image: General_physician,
  },
  {
    speciality: "Gynecologist",
    image: Gynecologist,
  },
  {
    speciality: "Dermatologist",
    image: Dermatologist,
  },
  {
    speciality: "Pediatricians",
    image: Pediatricians,
  },
  {
    speciality: "Neurologist",
    image: Neurologist,
  },
  {
    speciality: "Gastroenterologist",
    image: Gastroenterologist,
  },
];

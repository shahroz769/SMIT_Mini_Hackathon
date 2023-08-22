import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCa5XSrvDvKFwWNLYzvkeJkd10BUthxRQY",
    authDomain: "smit-mini-hackathon-a3fd4.firebaseapp.com",
    projectId: "smit-mini-hackathon-a3fd4",
    storageBucket: "smit-mini-hackathon-a3fd4.appspot.com",
    messagingSenderId: "575523341335",
    appId: "1:575523341335:web:870e575db4a604dd288852",
};
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    orderBy,
    query,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

let loader = document.querySelector("#loader");
let userLocal = JSON.parse(localStorage.getItem("userDb"));
if (!userLocal) {
    localStorage.clear();
}

const renderBlogs = async () => {
    const myBlogs = query(
        collection(db, "blogs"),
        orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(myBlogs);
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
        const allBlogsChild = document.querySelector(".all-blogs-child");
        const { text, fullName, title, date, userId, src } = doc.data();
        const htmlTemplate = `
        <div class="all-blogs-blog">
        <div class="all-blogs-blog-head">
        <div class="all-blogs-blog-profile-image">
        <img src="${src}" alt="Profile Picture">
        </div>
        <div class="all-blogs-blog-title">
        <h2>${title}</h2>
        <p>${fullName}</p>
        <p>${date}</p>
        </div>
            </div>
            <div class="all-blogs-blog-content">
                <p>${text}</p>
                </div>
                <div class="blog-edit">
                <button data-id="${userId}" class="see-all">See all from this user</button>
                </div>
                </div>
                `;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlTemplate;
        allBlogsChild.appendChild(tempDiv.firstElementChild);
    });
    const allFromUser = document.querySelectorAll(".see-all");
    allFromUser.forEach((button) => {
        button.addEventListener("click", (event) => {
            console.log("a");
            const buttonId = event.target.getAttribute("data-id");
            localStorage.setItem("buttonId", buttonId);
            console.log("Clicked button ID: " + buttonId);
            window.location.href = "../all-from-user/allfromuser.html";
        });
    });
    loader.classList.add("d-none");
};
renderBlogs();

const getGreeting = () => {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    let greeting = "";
    if (currentHour >= 5 && currentHour < 12) {
        greeting = "Good Morning";
    } else if (currentHour >= 12 && currentHour < 16) {
        greeting = "Good Afternoon";
    } else if (currentHour >= 16 && currentHour < 18) {
        greeting = "Good Evening";
    } else {
        greeting = "Good Night";
    }
    return greeting;
};

const greeting = getGreeting();
let greetingHead = document.getElementById("greeting");
greetingHead.textContent = greeting;

const signOutButton = document.getElementById("header-right-logout");

signOutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        localStorage.clear();
        window.location.replace("../index.html");
        console.log("User signed out successfully.");
    } catch (error) {
        console.error("Error signing out:", error.message);
    }
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
const firebaseConfig = {
    apiKey: "AIzaSyCtPWyKIRMJsfWsLmwwlsArGw9788eQ8Sg",
    authDomain: "hackathonsmit-ba16c.firebaseapp.com",
    projectId: "hackathonsmit-ba16c",
    storageBucket: "hackathonsmit-ba16c.appspot.com",
    messagingSenderId: "420550745532",
    appId: "1:420550745532:web:772da6c2eb1e6442191fb9",
};
import {
    getAuth,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    orderBy,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
let loader = document.querySelector("#loader");
let allFromUserImg = document.querySelector("#allFromUserImg");
let allFromUserFullName = document.querySelector("#allFromUserFullName");
let allFromUserCount = document.querySelector("#allFromUserCount");
let userDBLoacl = JSON.parse(localStorage.getItem("userDb"));
let userLocal = JSON.parse(localStorage.getItem("user"));
let buttonId = localStorage.getItem("buttonId");
let userNameElem = document.getElementById("userName");
let headerRightLogin = document.getElementById("header-right-login");
let headerRightAll = document.getElementById("header-right-all");
let headerRightDashboard = document.getElementById("header-right-dashboard");
let headerRightLogout = document.getElementById("header-right-logout");
let backToAllBtn = document.querySelector("#backToAllBtn");

if (userDBLoacl && userLocal) {
    userNameElem.textContent = userDBLoacl.fullName;
} else {
    userNameElem.style.display = "none";
    headerRightAll.style.display = "none";
    headerRightDashboard.style.display = "none";
    headerRightLogout.style.display = "none";
}

userLocal
    ? (headerRightLogin.style.display = "none")
    : (headerRightLogin.style.display = "block");

const myBlogs = query(
    collection(db, "blogs"),
    where("userId", "==", buttonId),
    orderBy("timestamp", "desc")
);
const querySnapshot = await getDocs(myBlogs);
let postText;
if (querySnapshot.size == 1) {
    postText = querySnapshot.size + " Post";
} else if (querySnapshot.size >= 2) {
    postText = querySnapshot.size + " Posts";
} else {
    postText = "User haven't posted yet";
}
allFromUserCount.textContent = postText;
querySnapshot.forEach((doc) => {
    allFromUserFullName.textContent = doc.data().fullName;
    const blogsFromUser = document.querySelector(".all-blogs-from-user-child");
    const { title, fullName, date, text, src } = doc.data();
    allFromUserImg.src = doc.data().src;
    const userBlog = document.createElement("div");
    userBlog.classList.add("all-blogs-from-user-blog");
    userBlog.innerHTML = `
            <div class="all-blogs-from-user-blog-head">
                <div class="all-blogs-from-user-blog-profile-image">
                    <img src="${src}" alt="Profile Picture">
                </div>
                <div class="all-blogs-from-user-blog-title">
                    <h2>${title}</h2>
                    <p>${fullName}</p>
                    <p>${date}</p>
                </div>
            </div>
            <div class="all-blogs-from-user-blog-content">
                <p>${text}</p>
            </div>
        `;
    blogsFromUser.appendChild(userBlog);
    loader.classList.add("d-none");
});

const signOutButton = document.getElementById("header-right-logout");
signOutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        localStorage.clear();
        window.location.replace("/");
        console.log("User signed out successfully.");
    } catch (error) {
        console.error("Error signing out:", error.message);
    }
});

backToAllBtn.addEventListener("click", () => {
    if (!userLocal) {
        window.location.href = "../";
    } else {
        window.location.href = "../all-blogs/allblogs.html";
    }
});

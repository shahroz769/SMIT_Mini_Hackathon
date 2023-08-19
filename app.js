// LoginJS
let uid;
let arr = [];
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCa5XSrvDvKFwWNLYzvkeJkd10BUthxRQY",
    authDomain: "smit-mini-hackathon-a3fd4.firebaseapp.com",
    projectId: "smit-mini-hackathon-a3fd4",
    storageBucket: "smit-mini-hackathon-a3fd4.appspot.com",
    messagingSenderId: "575523341335",
    appId: "1:575523341335:web:870e575db4a604dd288852",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Check if the current page is "dashboard.html"
if (window.location.pathname === "/dashboard.html") {
    // Inside the onAuthStateChanged callback
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            uid = user.uid;
            console.log("Uid ==>", uid);

            // Now fetch user data based on the retrieved uid
            const docRef = doc(db, "blogs", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                arr = docSnap.data().arr;
                // Assuming 'userData.arr' is an array of blog data
                const blogParent = document.querySelector(".blog-parent");

                // Loop through each entry in the 'arr' array and create blog elements
                userData.arr.forEach((blogData) => {
                    const { title, fullName, date, text } = blogData;

                    // Create a new blog element
                    const blog = document.createElement("div");
                    blog.classList.add("blog");
                    blog.innerHTML = `
                        <div class="blog-head">
                            <div class="blog-profile-image">
                                <img src="./assets/profile.jpg" alt="Profile Picture">
                            </div>
                            <div class="blog-title">
                                <h2>${title}</h2>
                                <p>${fullName}</p>
                                <p>${date}</p>
                            </div>
                        </div>
                        <div class="blog-content">
                            <p>${text}</p>
                        </div>
                        <div class="blog-edit">
                            <button class="delete-button">Delete</button>
                            <button class="edit-button">Edit</button>
                        </div>
                    `;

                    // Append the blog element to the parent container
                    blogParent.appendChild(blog);
                });
            } else {
                console.log("No such document!");
                arr = [];
            }
        } else {
            // User is signed out
            console.log("User Signed Out");
            // Redirect to allblogs.html
            window.location.href = "/allblogs.html";
        }
    });
}

// Check if the current page is "allblogs.html"
if (window.location.pathname === "/allblogs.html") {
    // Fetch all documents in the "blogs" collection
    const querySnapshot = await getDocs(collection(db, "blogs"));

    querySnapshot.forEach((doc) => {
        // Access each document's data
        const blogData = doc.data();
        // Process each document's data here
        console.log("Document data:", blogData);
        console.log(doc.data().arr);
        // Assuming doc.data().arr is your array of objects
        const arr = doc.data().arr;

        // Get a reference to the parent div
        const allBlogsChild = document.querySelector(".all-blogs-child");

        // Loop through the array and append HTML elements for each object
        arr.forEach((item) => {
            const { text, fullName, title, date, userId } = item;

            // Create a template literal with the HTML structure
            const htmlTemplate = `
        <div class="all-blogs-blog">
            <div class="all-blogs-blog-head">
                <div class="all-blogs-blog-profile-image">
                    <img src="./assets/profile.jpg" alt="Profile Picture">
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
                <button id="${userId}" class="see-all">See all from this user</button>
            </div>
        </div>
    `;

            // Create a temporary div element to hold the template literal
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = htmlTemplate;

            // Append the template to the parent div
            allBlogsChild.appendChild(tempDiv.firstElementChild);
        });
    });
}

let blogsObj = {};

// Get current Date for blog entry
window.getCurrentDateFormatted = function () {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();

    // Function to add the appropriate suffix for the day
    function getDayWithSuffix(day) {
        if (day >= 11 && day <= 13) {
            return `${day}th`;
        }
        switch (day % 10) {
            case 1:
                return `${day}st`;
            case 2:
                return `${day}nd`;
            case 3:
                return `${day}rd`;
            default:
                return `${day}th`;
        }
    }

    const formattedDate = `${month} ${getDayWithSuffix(day)}, ${year}`;
    return formattedDate;
};

// Greeting according to time of day

window.getGreeting = function () {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    let greeting = "";

    if (currentHour >= 5 && currentHour < 12) {
        greeting = "Good morning";
    } else if (currentHour >= 12 && currentHour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }

    return greeting;
};

if (window.location.pathname === "/allblogs.html") {
    const greeting = getGreeting();
    console.log(`${greeting} Readers!`);

    let greetingHead = document.getElementById("greeting");
    greetingHead.textContent = greeting;
}

// Get all the buttons with the class "see-all"
const buttons = document.querySelectorAll(".see-all");

// Add a click event listener to each button
buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
        // Get the ID of the clicked button
        const buttonId = event.target.id;

        // Save the button ID in local storage
        localStorage.setItem("buttonId", buttonId);

        console.log("Clicked button ID: " + buttonId);
        window.location.href = "/allfromuser.html";
    });
});

// Check if the current page is allfromuser.html
if (window.location.href.endsWith("allfromuser.html")) {
    // Retrieve the button ID from local storage
    const buttonId = localStorage.getItem("buttonId");

    // Check if the button ID exists in local storage
    if (buttonId) {
        console.log("Button ID retrieved from local storage: " + buttonId);
        // You can use the buttonId variable as needed

        // Now fetch user data based on the retrieved uid
        const docRef = doc(db, "blogs", buttonId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            arr = userData.arr; // Assuming 'userData.arr' is an array of blog data
            const blogsFromUser = document.querySelector(".all-blogs-from-user-child");

            // Loop through each entry in the 'arr' array and create blog elements
            userData.arr.forEach((blogData) => {
                const { title, fullName, date, text } = blogData;

                // Create a new blog element
                const userBlog = document.createElement("div");
                userBlog.classList.add("all-blogs-from-user-blog");
                userBlog.innerHTML = `
                <div class="all-blogs-from-user-blog">
                <div class="all-blogs-from-user-blog-head">
                    <div class="all-blogs-from-user-blog-profile-image">
                        <img src="./assets/profile.jpg" alt="Profile Picture">
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
            </div>
                `;

                // Append the blog element to the parent container
                blogsFromUser.appendChild(userBlog);
            });
        } else {
            console.log("No such document!");
        }
    } else {
        console.log("Button ID not found in local storage.");
    }
}



// Function to publish blog

window.publishBlog = function () {
    const currentDateFormatted = getCurrentDateFormatted();
    console.log(currentDateFormatted);
    let blogTitle = document.getElementById("publishBlogTitle").value;
    let blogText = document.getElementById("publishBlogContent").value;
    console.log(blogTitle, blogText);
    let blogParent = document.querySelector(".blog-parent");
    let blog = document.createElement("div");
    blog.classList.add("blog");
    blog.innerHTML = `
                        <div class="blog-head">
                            <div class="blog-profile-image">
                                <img src="./assets/profile.jpg" alt="Profile Picture">
                            </div>
                            <div class="blog-title">
                                <h2>${blogTitle}</h2>
                                <p>Inzamam Malik</p>
                                <p>${currentDateFormatted}</p>
                            </div>
                        </div>
                        <div class="blog-content">
                            <p>${blogText}</p>
                        </div>
                        <div class="blog-edit">
                            <button class="delete-button">Delete</button>
                            <button class="edit-button">Edit</button>
                        </div>
    `;
    blogParent.appendChild(blog);
    let blogObject = {
        fullName: "Inzamam Malik",
        date: currentDateFormatted,
        title: blogTitle,
        text: blogText,
        userId: uid,
    };
    arr.push(blogObject);
    console.log(arr);

    const dataToSend = {
        arr: arr,
    };

    // Replace 'user.uid' with the appropriate document ID where you want to store the 'arr' array
    setDoc(doc(db, "blogs", uid), dataToSend)
        .then(() => {
            console.log("Document successfully written to Firestore!");
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });

    document.getElementById("publishBlogTitle").value = "";
    document.getElementById("publishBlogContent").value = "";
};

document
    .getElementById("publishBlogButton")
    .addEventListener("click", function () {
        publishBlog();
    });
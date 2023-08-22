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
    addDoc,
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    onSnapshot,
    orderBy,
    query,
    where,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
let userDbLocal = JSON.parse(localStorage.getItem("userDb"));
let userLocal = JSON.parse(localStorage.getItem("user"));
let headerRightLogin = document.getElementById("header-right-login");
userLocal
    ? (headerRightLogin.style.display = "none")
    : (headerRightLogin.style.display = "block");
let userNameElem = document.getElementById("userName");
userNameElem.textContent = userDbLocal.fullName;
let loader = document.querySelector("#loader");

let indexToDelete;
let toEdit = {};
let blogToEditRef;
let uid = userLocal.uid;

const rederDashboard = async () => {
    const blogParent = document.querySelector(".blog-parent");
    const myBlogs = query(
        collection(db, "blogs"),
        where("userId", "==", userLocal.uid),
        orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(myBlogs);
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
        const { title, fullName, date, text, src, postId } = doc.data();
        const blog = document.createElement("div");
        blog.classList.add("blog");
        blog.innerHTML = `
                        <div class="blog-head">
                            <div class="blog-profile-image">
                                <img src="${src}" alt="Profile Picture">
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
                            <button class="delete-button" data-id="${postId}">Delete</button>
                            <button class="edit-button" data-id="${postId}">Edit</button>
                        </div>
                    `;
        blogParent.appendChild(blog);
    });

    let deleteButton = document.querySelectorAll(".delete-button");
    deleteButton.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            let c = confirm("Are you sure you want to delete this?");
            if (c) {
                let idToDelete = e.target.getAttribute("data-id");
                idToDelete = Number(idToDelete);
                let blogToDeleteRef = query(
                    collection(db, "blogs"),
                    where("postId", "==", idToDelete)
                );
                const querySnapshot = await getDocs(blogToDeleteRef);
                const documentSnapshot = querySnapshot.docs[0];
                const blogRef = doc(db, "blogs", documentSnapshot.id);
                await deleteDoc(blogRef);
                window.location.reload();
            }
        });
    });

    let editButton = document.querySelectorAll(".edit-button");
    editButton.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            try {
                let editWindow = document.getElementById("edit-window");
                editWindow.style.display = "block";
                let idToEdit = e.target.getAttribute("data-id");
                idToEdit = Number(idToEdit);
                blogToEditRef = query(
                    collection(db, "blogs"),
                    where("postId", "==", idToEdit)
                );
                console.log("blogToEditRef", blogToEditRef);
                const querySnapshot = await getDocs(blogToEditRef);
                querySnapshot.forEach((doc) => {
                    toEdit = doc.data();
                });
                document.getElementById("editTitle").value = toEdit.title;
                document.getElementById("editBlog").value = toEdit.text;
            } catch (error) {
                console.log(error.message);
            }
        });
    });

    let saveBtn = document.querySelectorAll(".save-btn");
    saveBtn.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            let titleInput = document.getElementById("editTitle").value;
            let textInput = document.getElementById("editBlog").value;
            toEdit.title = titleInput;
            toEdit.text = textInput;
            const querySnapshot = await getDocs(blogToEditRef);
            const documentSnapshot = querySnapshot.docs[0];
            const blogRef = doc(db, "blogs", documentSnapshot.id);
            await updateDoc(blogRef, {
                title: titleInput,
                titleInput: textInput,
            });
            window.location.reload();
        });
    });

    const editWindow = () => {
        document.getElementById("edit-window").style.display = "none";
    };
    document.querySelectorAll(".cancel-btn").forEach((btn) => {
        btn.addEventListener("click", editWindow);
    });
    loader.classList.add("d-none");
};
rederDashboard();

// Get current Date for blog entry
const getCurrentDateFormatted = () => {
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

// Function to publish blog
let userSrc = null;
let blogsObj = {};
const publishBlog = async () => {
    try {
        loader.classList.remove("d-none");
        const docRef = await doc(db, "users", userLocal.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const userData = await docSnap.data();
            userSrc = userData.src;
            console.log("User Data:", userData);
        } else {
            console.log("No such document!");
        }
        const currentDateFormatted = getCurrentDateFormatted();
        console.log(currentDateFormatted);
        const ref = doc(db, "postId", "id");
        // Fetch the current data
        const snap = await getDoc(ref);
        const dbData = snap.data();
        const newId = dbData.id + 1;
        await setDoc(ref, { id: newId })
            .then(() => {
                console.log("Document successfully updated in Firestore!");
                window.location.reload();
            })
            .catch((error) => {
                console.error("Error updating document: ", error);
            });
        let blogTitle = document.getElementById("publishBlogTitle").value;
        let blogText = document.getElementById("publishBlogContent").value;
        console.log(blogTitle, blogText);
        let blogParent = document.querySelector(".blog-parent");
        let blog = document.createElement("div");
        blog.classList.add("blog");
        blog.innerHTML = `
                        <div class="blog-head">
                            <div class="blog-profile-image">
                                <img src="${userSrc}" alt="Profile Picture">
                            </div>
                            <div class="blog-title">    
                                <h2>${blogTitle}</h2>
                                <p>${userDbLocal.fullName}</p>
                                <p>${currentDateFormatted}</p>
                            </div>
                        </div>
                        <div class="blog-content">
                            <p>${blogText}</p>
                        </div>
                        <div class="blog-edit">
                            <button class="delete-button" data-id="${newId}">Delete</button>
                            <button class="edit-button" data-id="${newId}">Edit</button>
                        </div>
    `;
        blogParent.prepend(blog);
        const docToDb = await addDoc(collection(db, "blogs"), {
            fullName: userDbLocal.fullName,
            date: currentDateFormatted,
            title: blogTitle,
            text: blogText,
            postId: newId,
            userId: uid,
            src: userSrc,
            timestamp: new Date().getTime(),
        });
        console.log("Document written with ID: ", docRef.id);
        document.getElementById("publishBlogTitle").value = "";
        document.getElementById("publishBlogContent").value = "";
    } catch (error) {
        console.log(error.message);
    }
};

let publishBtn = document.getElementById("publishBlogButton");
publishBtn.addEventListener("submit", publishBlog);

const signOutButton = document.getElementById("header-right-logout");

signOutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        localStorage.clear();
        window.location.replace("../");
        console.log("User signed out successfully.");
    } catch (error) {
        console.error("Error signing out:", error.message);
    }
});

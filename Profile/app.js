import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
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
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";
import {
    getAuth,
    onAuthStateChanged,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    getDoc,
    addDoc,
    deleteDoc,
    doc,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage(app);
let uid = null;
onAuthStateChanged(auth, (user) => {
    if (user) {
        uid = user.uid;
        console.log("Uid ==>", uid);
    } else {
        uid = null;
        console.log("User Signed Out");
    }
});
let userLocal = JSON.parse(localStorage.getItem("userDb"));
let userLocalUid = JSON.parse(localStorage.getItem("user"));
let userNameElem = document.getElementById("userName");
let userNameEdit = document.getElementById("userNameEdit");
let headerRightLogin = document.getElementById("header-right-login");
userLocal
    ? (headerRightLogin.style.display = "none")
    : (headerRightLogin.style.display = "block");
userNameEdit.textContent = userLocal.fullName;
userName.textContent = userLocal.fullName;
let user = JSON.parse(localStorage.getItem("user"));
let userImg = document.getElementById("userImg");
let loader = document.querySelector("#loader");

const docRef = doc(db, "users", user.uid);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
    const existingData = docSnap.data();
    userImg.src = existingData.src;
    loader.classList.add("d-none");
} else {
    console.log("Document does not exist.");
}

const changeProfile = async (newSrc) => {
    const userBlogs = query(
        collection(db, "blogs"),
        where("userId", "==", userLocalUid.uid)
    );
    const querySnapshot = await getDocs(userBlogs);
    const updatePromises = [];
    querySnapshot.forEach((doc) => {
        const docRef = doc.ref;
        updatePromises.push(updateDoc(docRef, { src: newSrc }));
    });
    await Promise.all(updatePromises);
};

const inputFile = document.getElementById("imageInput");
const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
        const mountainsRef = ref(storage, `images/${uid}`);
        const uploadTask = uploadBytesResumable(mountainsRef, file);
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");
                switch (snapshot.state) {
                    case "paused":
                        console.log("Upload is paused");
                        break;
                    case "running":
                        console.log("Upload is running");
                        break;
                }
            },
            (error) => {
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};

inputFile.addEventListener("change", async (event) => {
    try {
        let file = event.target.files[0];
        const res = await uploadFile(file);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const existingData = docSnap.data();
            existingData.src = res;
            try {
                await updateDoc(docRef, existingData);
                console.log("Document successfully updated!");
                changeProfile(res);
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        } else {
            console.log("Document does not exist.");
        }
        console.log("res-->", res);
        let img = document.getElementById("userImg");
        img.src = res;
    } catch (err) {
        console.log(err);
    }
});

const updatePassForm = document.getElementById("updatePassForm");
updatePassForm.addEventListener("submit", async () => {
    const oldPassword = document.getElementById("oldPass").value;
    const newPassword = document.getElementById("newPass").value;
    const repeatPassword = document.getElementById("RepeatPass").value;
    if (newPassword !== repeatPassword) {
        console.log("New passwords do not match.");
        return;
    }
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, oldPassword);
    try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        console.log("Password updated successfully!");
        oldPassword.value = "";
        newPassword.value = "";
        repeatPassword.value = "";
    } catch (error) {
        console.error("Error updating password:", error.message);
    }
});
const togglePass = (event) => {
    let eye = event.target;
    let input = eye.previousElementSibling;
    if (input.type == "password") {
        input.type = "text";
        eye.src = "../assets/invisible.svg";
        eye.previousElementSibling.focus();
    } else {
        input.type = "password";
        eye.src = "../assets/visible.svg";
        eye.previousElementSibling.focus();
    }
};
let passwordInput = document.querySelectorAll(
    'input.form-input[type="password"]'
);
passwordInput.forEach((input) => {
    input.nextElementSibling.addEventListener("click", togglePass);
});

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

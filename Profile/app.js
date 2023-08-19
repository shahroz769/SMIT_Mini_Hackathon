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
    getDoc,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
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
let userNameElem = document.getElementById("userName");
let userNameEdit = document.getElementById("userNameEdit");
userNameEdit.textContent = userLocal.fullName;
userName.textContent = userLocal.fullName;
let user = JSON.parse(localStorage.getItem("user"));
let userImg = document.getElementById("userImg");
const docRef = doc(db, "users", user.uid);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
    const existingData = docSnap.data();
    userImg.src = existingData.src;
} else {
    console.log("Document does not exist.");
}

const changeProfile = async (newSrc) => {
    const docRef = doc(db, "blogs", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const existingData = docSnap.data();
        if (existingData.arr && Array.isArray(existingData.arr)) {
            existingData.arr.forEach((item) => {
                item.src = newSrc;
            });
            try {
                await updateDoc(docRef, existingData);
                console.log("Document updated successfully!");
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        } else {
            console.log("The 'arr' field is not an array or does not exist.");
        }
    } else {
        console.log("Document does not exist.");
    }
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

const updatePassBtn = document.getElementById("updatePassBtn");
updatePassBtn.addEventListener("click", async () => {
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

const signOutButton = document.getElementById("header-right-logout");

signOutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        console.log("User signed out successfully.");
        if (!uid) {
            window.location.replace("../index.html");
        }
    } catch (error) {
        console.error("Error signing out:", error.message);
    }
});
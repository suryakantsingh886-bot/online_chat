import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyDJYGozpA1T-7knaa0pXwPxbkFoDaA0rqQ",
    authDomain: "my-chat-website-e280c.firebaseapp.com",
    projectId: "my-chat-website-e280c",
    storageBucket: "my-chat-website-e280c.firebasestorage.app",
    messagingSenderId: "968675176354",
    appId: "1:968675176354:web:1f1049d5b7410fad010cfb"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// HTML elements

const authContainer = document.getElementById("authContainer");
const chatContainer = document.getElementById("chatContainer");

const emailInput = document.getElementById("emailInput");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");

const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");

const logoutButton = document.getElementById("logoutButton");

const authMessage = document.getElementById("authMessage");

const userEmail = document.getElementById("userEmail");

const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const chatMessages = document.getElementById("chatMessages");


// CREATE ACCOUNT

signupButton.addEventListener("click", async () => {

    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (email === "" || username === "" || password === "") {

        authMessage.textContent =
            "Please enter username, email and password.";

        return;
    }

    if (username.length < 3) {

        authMessage.textContent =
            "Username must be at least 3 characters.";

        return;
    }

    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        // Save user profile in Firestore

        await setDoc(
            doc(db, "users", user.uid),
            {
                username: username,
                email: email
            }
        );

        authMessage.textContent =
            "Account created!";

    } catch (error) {

        authMessage.textContent =
            error.message;

    }

});

// LOGIN

loginButton.addEventListener("click", async () => {

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (email === "" || password === "") {

        authMessage.textContent = "Please enter email and password.";

        return;
    }

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        authMessage.textContent = "Login successful!";

    } catch (error) {

        authMessage.textContent = error.message;

    }

});


// LOGOUT

logoutButton.addEventListener("click", async () => {

    await signOut(auth);

});


// AUTH STATE

onAuthStateChanged(auth, (user) => {

    if (user) {

        // User is logged in

        authContainer.style.display = "none";

        chatContainer.style.display = "flex";

  loadUserProfile(user);
// LOAD USER PROFILE

async function loadUserProfile(user) {

    try {

        const userDocument = await getDoc(
            doc(db, "users", user.uid)
        );

        if (userDocument.exists()) {

            const userData = userDocument.data();

            userEmail.textContent =
                userData.username;

        } else {

            userEmail.textContent =
                user.email;

        }

    } catch (error) {

        console.error(
            "Error loading user profile:",
            error
        );

        userEmail.textContent =
            user.email;
    }
}
loadMessages();

    } else {

        // User is logged out

        authContainer.style.display = "flex";

        chatContainer.style.display = "none";

    }

});


// LOAD MESSAGES

function loadMessages() {

    const messagesQuery = query(
        collection(db, "messages"),
        orderBy("createdAt")
    );


    onSnapshot(messagesQuery, (snapshot) => {

        chatMessages.innerHTML = "";


        snapshot.forEach((doc) => {

            const message = doc.data();

            const messageDiv = document.createElement("div");

            const currentUser = auth.currentUser;

            if (
                currentUser &&
                message.senderId === currentUser.uid
            ) {

                messageDiv.classList.add(
                    "message",
                    "sent"
                );

            } else {

                messageDiv.classList.add(
                    "message",
                    "received"
                );

            }


           const messageUsername = document.createElement("strong");

messageUsername.textContent =
    message.senderUsername || "Unknown User";


const messageText = document.createElement("p");

messageText.textContent = message.text;


messageDiv.appendChild(messageUsername);

messageDiv.appendChild(messageText);

            chatMessages.appendChild(messageDiv);

        });


        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    });

}


// SEND MESSAGE

async function sendMessage() {

    const message = messageInput.value.trim();

    const user = auth.currentUser;


    if (message === "") {
        return;
    }


    if (!user) {

        alert("Please login first.");

        return;
    }


    try {

        await addDoc(
            collection(db, "messages"),
            {

                text: message,

                senderId: user.uid,

               senderEmail: user.email,
senderUsername: userEmail.textContent,
                createdAt: serverTimestamp()

            }
        );


        messageInput.value = "";

    } catch (error) {

        console.error(
            "Error sending message:",
            error
        );

    }

}


// SEND BUTTON

sendButton.addEventListener(
    "click",
    sendMessage
);


// ENTER KEY

messageInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);

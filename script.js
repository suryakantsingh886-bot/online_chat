import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


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


const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("chatMessages");


const messagesQuery = query(
    collection(db, "messages"),
    orderBy("createdAt")
);


onSnapshot(messagesQuery, (snapshot) => {

    chatMessages.innerHTML = "";

    snapshot.forEach((doc) => {

        const message = doc.data();

        const messageDiv = document.createElement("div");

        messageDiv.classList.add(
            "message",
            "sent"
        );

        const messageText = document.createElement("p");

        messageText.textContent = message.text;

        messageDiv.appendChild(messageText);

        chatMessages.appendChild(messageDiv);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
});


async function sendMessage() {

    const message = messageInput.value.trim();

    if (message === "") {
        return;
    }

    try {

        await addDoc(collection(db, "messages"), {

            text: message,

            createdAt: serverTimestamp()

        });

        messageInput.value = "";

    } catch (error) {

        console.error("Error sending message:", error);

        alert("Message could not be sent.");

    }
}


sendButton.addEventListener("click", sendMessage);


messageInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        sendMessage();

    }

});
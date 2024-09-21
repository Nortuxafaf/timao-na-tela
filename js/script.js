// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC8Gu6kCm2QDwZneCHI0H2JOJdMvtqU1ac",
    authDomain: "chat-da-live.firebaseapp.com",
    databaseURL: "https://chat-da-live-default-rtdb.firebaseio.com",
    projectId: "chat-da-live",
    storageBucket: "chat-da-live.appspot.com",
    messagingSenderId: "327884709556",
    appId: "1:327884709556:web:35bbec05593f2cd30c81e1"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let userName = '';
const chatBox = document.getElementById('chat-box');
const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message-input');
const nameInput = document.getElementById('name-input');
const nameBtn = document.getElementById('name-btn');

nameBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const nameRegex = /^[a-zA-Z0-9]+$/; 

    if (name && nameRegex.test(name)) {
        userName = name;
        nameInput.style.display = 'none';
        nameBtn.style.display = 'none';
        messageInput.style.display = 'inline-block'; 
        sendBtn.style.display = 'inline-block'; 
        messageInput.focus(); 
    } else {
        alert('Por favor, digite um nome válido (apenas letras e números).');
    }
});

sendBtn.addEventListener('click', () => {
    sendMessage();
});

messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Configuração de presença para monitorar usuários online
const presenceRef = database.ref('.info/connected');
const onlineUsersRef = database.ref('onlineUsers');

presenceRef.on('value', (snapshot) => {
    if (snapshot.val()) {
        const userRef = onlineUsersRef.push();
        userRef.set(true);
        userRef.onDisconnect().remove(); // Remove o usuário da lista quando ele desconectar
    }
});

/// Função para contar e exibir usuários online
onlineUsersRef.on('value', (snapshot) => {
    const userCount = snapshot.numChildren(); // Conta quantos usuários estão online
    document.getElementById('user-count-number').innerText = userCount;
});


function sendMessage() {
    const newMessage = messageInput.value.trim();
    if (newMessage) {
        const messageData = {
            user: userName,
            text: newMessage,
            timestamp: Date.now()
        };
        database.ref('messages').push(messageData);
        messageInput.value = '';
        disableSendButton(5); 
    }
}

function disableSendButton(seconds) {
    sendBtn.disabled = true;
    messageInput.disabled = true;
    let remainingTime = seconds;
    const interval = setInterval(() => {
        sendBtn.innerText = `Aguarde ${remainingTime}s`;
        remainingTime--;

        if (remainingTime < 0) {
            clearInterval(interval);
            sendBtn.innerText = 'Enviar';
            sendBtn.disabled = false;
            messageInput.disabled = false;
        }
    }, 1000);
}

function displayMessage(user, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', user === userName ? 'sent' : 'received');

    const userNameSpan = document.createElement('span');
    userNameSpan.classList.add('message-username');
    userNameSpan.innerText = user + ':';

    const messageTextSpan = document.createElement('span');
    messageTextSpan.classList.add('message-text');
    messageTextSpan.innerText = text;

    messageDiv.appendChild(userNameSpan);
    messageDiv.appendChild(messageTextSpan);
    chatBox.appendChild(messageDiv);

    const messages = chatBox.getElementsByClassName('message');
    if (messages.length > 5) {
        chatBox.removeChild(messages[0]);
    }
    chatBox.scrollTop = chatBox.scrollHeight; 
}

database.ref('messages').on('child_added', (snapshot) => {
    const { user, text } = snapshot.val();
    displayMessage(user, text);
});

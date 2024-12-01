/* =========== Admin login modal logic =========== */
const modal = document.getElementById('loginModal');
const openModalButton = document.getElementById('openModal');
const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

openModalButton.onclick = () => {
    modal.style.display = 'flex';
};

window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Handle login
loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            modal.style.display = 'none';
            // Redirect to login or home page after logout
            window.location.href = '/admin';
        } else {
            message.style.display = 'block';
            message.textContent = 'Invalid credentials';
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
};


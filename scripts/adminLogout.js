/* =========== Admin logout logic =========== */
// Handle logout
document.getElementById('logout').addEventListener('click', () => {
    fetch('/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
    })
    .then(response => {
        if (response.ok) {
            // Redirect to login or home page after logout
            window.location.href = '/';
        } else {
            console.error('Failed to log out:', response.statusText);
        }
    })
    .catch(err => console.error('Error logging out:', err));
});

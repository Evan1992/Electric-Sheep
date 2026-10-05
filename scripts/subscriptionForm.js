/* =========== Admin subscription forms =========== */
// Each toggle button paired with the form it opens
const subscriptionForms = [];

// Hide a form and discard any unsaved input
function closeForm(form) {
    form.hidden = true;
    form.reset();
}

// Show or hide a form, focusing its first input when shown
function toggleForm(form) {
    if (!form.hidden) {
        closeForm(form);
        return;
    }
    form.hidden = false;
    form.querySelector('input[name="name"]').focus();
}

function bindToggle(button, form) {
    subscriptionForms.push({ button, form });
    button.addEventListener('click', () => toggleForm(form));
}

// Add button opens the add-subscription form
bindToggle(document.getElementById('addSubscriptionBtn'), document.getElementById('subscriptionForm'));

// Each Edit button opens its matching edit form
document.querySelectorAll('.subscription_edit_btn').forEach(btn => {
    bindToggle(btn, btn.closest('.link_wrapper').querySelector('.subscription_edit_form'));
});

// Clicking anywhere outside an open form (and its own button) cancels it
document.addEventListener('click', (event) => {
    subscriptionForms.forEach(({ button, form }) => {
        if (!form.hidden && !form.contains(event.target) && !button.contains(event.target)) {
            closeForm(form);
        }
    });
});

// Ask before deleting a subscription
document.querySelectorAll('.subscription_delete_form').forEach(form => {
    form.addEventListener('submit', (event) => {
        if (!confirm('Delete this subscription?')) {
            event.preventDefault();
        }
    });
});

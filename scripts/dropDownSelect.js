// Select the dropdown elements
const dropdowns = document.querySelectorAll('.dropdown');
const dropdownContents = document.querySelectorAll('.dropdown-content');
const dropdownLabels = document.querySelectorAll('.dropdown-label');
const dropdownOptionsPlatform = document.querySelectorAll('.dropdown-content-platform a');
const dropdownOptionsCategory = document.querySelectorAll('.dropdown-content-category a');
const platformInput = document.getElementById('platform-input'); // Hidden input
const categoryInput = document.getElementById('category-input'); // Hidden input
const inputContainers = [platformInput, categoryInput];
const selectedItemsContainers = document.querySelectorAll('.selected-items');
let selectedPlatforms = [];
let selectedCategories = [];
let selectedItems = [selectedPlatforms, selectedCategories];

// Toggle dropdown visibility on click
dropdownLabels.forEach((dropdownLabel, index) => {
    dropdownLabel.addEventListener('click', () => {
        const isVisible = dropdownContents[index].style.display === 'block';
        dropdownContents[index].style.display = isVisible ? 'none' : 'block';
    });
});

// Close the dropdown when clicking outside of it
document.addEventListener('click', (event) => {
    dropdowns.forEach((dropdown, index) => {
        if (!dropdown.contains(event.target)) {
            dropdownContents[index].style.display = 'none';
        }
    });
});

// Add the selected item when an option is clicked
dropdownOptionsPlatform.forEach(option => {
    option.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent navigation
        const selectedValue = event.target.getAttribute('data-value'); // Get option value
        if (!selectedPlatforms.includes(selectedValue)) {
            addSelectedItem(selectedValue, 0);
        }
        dropdownContents[0].style.display = 'none'; // Hide dropdown
    });
});

dropdownOptionsCategory.forEach(option => {
    option.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent navigation
        const selectedValue = event.target.getAttribute('data-value'); // Get option value
        if (!selectedCategories.includes(selectedValue)) {
            addSelectedItem(selectedValue, 1);
        }
        dropdownContents[1].style.display = 'none'; // Hide dropdown
    });
});

function addSelectedItem(value, index) {
    selectedItems[index].push(value);
    inputContainers[index].value = selectedItems[index]; // Update hidden input value

    const item = document.createElement('div');
    item.classList.add('selected-item');
    item.textContent = value;

    const removeBtn = document.createElement('span');
    removeBtn.classList.add('remove-btn');
    removeBtn.textContent = '✖';
    removeBtn.addEventListener('click', () => {
        item.remove();
        selectedItems[index].splice(selectedItems[index].indexOf(value), 1);
        inputContainers[index].value = selectedItems[index]; // Update hidden input value
    });

    item.appendChild(removeBtn);
    selectedItemsContainers[index].appendChild(item);
}
// Select the dropdown elements
const dropdowns = document.querySelectorAll('.dropdown');
const dropdownLabels = document.querySelectorAll('.dropdown-label');
const dropdownContents = document.querySelectorAll('.dropdown-content');
const dropDownOptions = document.querySelectorAll('.dropdown-content a');
const inputs = document.querySelectorAll('.hidden-input'); // Hidden input
const selectedItemsContainers = document.querySelectorAll('.selected-items');
const alreadySelectedItemsContainers = document.querySelectorAll('.selected-item');
let selectedItems = {
    "platform": [],
    "genre": []
}

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
dropDownOptions.forEach(option => {
    option.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent navigation
        const selectedKey = event.target.getAttribute('data-key'); // Get option key
        const selectedValue = event.target.getAttribute('data-value'); // Get option value

        if (!selectedItems[selectedKey].includes(selectedValue)) {
            addSelectedItem(selectedKey, selectedValue);
        }

        dropdownContents.forEach((dropdownContent) => {
            if (dropdownContent.getAttribute('data-key') === selectedKey) {
                dropdownContent.style.display = 'none'; // Hide dropdown
            }
        });
    });
});

// Add the selected items from the database to the list selectedPlatforms and selectedGenres
alreadySelectedItemsContainers.forEach(item => {
    const value = Array.from(item.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .join('');
    key = item.getAttribute('data-key');
    selectedItems[key].push(value);

    const removeBtn = item.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => {
        item.remove();
        selectedItems[key].splice(selectedItems[key].indexOf(value), 1);
        inputs.forEach((input) => {
            if (input.getAttribute('data-key') === key) {
                input.value = selectedItems[key]; // Update hidden input value
            }
        });
    });
});

function addSelectedItem(key, value) {
    // Update hidden input value
    selectedItems[key].push(value);
    inputs.forEach((input) => {
        if (input.getAttribute('data-key') === key) {
            input.value = selectedItems[key];
        }
    });

    const item = document.createElement('div');
    item.classList.add('selected-item');
    item.textContent = value;

    const removeBtn = document.createElement('span');
    removeBtn.classList.add('remove-btn');
    removeBtn.textContent = '✖';
    removeBtn.addEventListener('click', () => {
        item.remove();
        selectedItems[key].splice(selectedItems[key].indexOf(value), 1);
        inputs.forEach((input) => {
            if (input.getAttribute('data-key') === key) {
                input.value = selectedItems[key]; // Update hidden input value
            }
        });
    });

    item.appendChild(removeBtn);
    selectedItemsContainers.forEach((selectedItemsContainer) => {
        if (selectedItemsContainer.getAttribute('data-key') === key) {
            selectedItemsContainer.appendChild(item);
        }
    });
}
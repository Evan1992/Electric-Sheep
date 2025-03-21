// change event listener
// Reference: https://stackoverflow.com/questions/69473874/html-radio-button-action-open-input
document.getElementsByName("rate").forEach(rate => {
    rate.addEventListener('change', function() {
        if(this.checked) {
            // Get updated stars
            const rate = document.getElementsByName("rate")
            let stars = 0
            for(let i = 0; i < rate.length; i++) {
                if(rate[i].checked === true) {
                    stars = rate.length - i
                }
            }

            // Send the updated stars to database
            // Reference: https://stackoverflow.com/questions/6912197/change-value-of-input-and-submit-form-in-javascript
            document.getElementById("stars").value = stars
            document.getElementById("updateRate").submit()
        }
    })
})
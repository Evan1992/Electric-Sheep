/**
 * @abstract This API allows you to create simple numeric counters. IaaS, Integer as a Service.
 * @reference https://countapi.xyz/
 */

/**
 * @instruction use following url to create a new API
 *  https://api.countapi.xyz/create?namespace=echo-of-time&key=visit-counter&value=0
 * then we can use following url to get the value
 *  https://api.countapi.xyz/get/echo-of-time/visit-counter
 * then we we can use following url to update the counter
 *  https://api.countapi.xyz/update/echo-of-time/visit-counter/?amount=1
 */

const countElement = document.getElementById('visit_counts')
/* define the function updateVisitCount() */
updateVisitCount = () =>{
    // fetch the API, each time when we call the API, count will increase by 1
    fetch(`https://api.countapi.xyz/update/echo-of-time/visit-counter/?amount=1`)
        .then(res => res.json())
        .then(res =>{
            countElement.innerHTML = res.value
        })
}

/* call the function updateVisitCount() */
updateVisitCount()



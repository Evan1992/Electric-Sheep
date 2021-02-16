// const countElement2 = document.querySelector('#count')
/* define the function updateVisitCount() */
updateVisitorCount = () =>{
    // fetch the API, each time when we call the API, count will increase by 1
    fetch(`https://api.ipify.org?format=json`)
        .then(res => res.json())
        .then(console.log)
}

/* call the function updateVisitorCount() */
updateVisitorCount()
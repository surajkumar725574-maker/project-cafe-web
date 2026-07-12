
// const API_URL = "https://project-cafe-web.onrender.com"

// let API_URL;

// if(window.location.hostname==="localhost"){
//      API_URL = "http://localhost:3000";
// }
// else{
//     API_URL="https://project-cafe-web.onrender.com"
// }

const API_URL=window.location.hostname==="localhost"
?"http://localhost:3000"
:"https://project-cafe-web.onrender.com"


function getCustomerId(){
       let customerId=localStorage.getItem("customerId");
    if(!customerId){
        customerId=generateCustomerId();
      
        localStorage.setItem(
            "customerId",
            customerId
        );
    }
    return customerId;
}

function generateCustomerId(){
   return `${Date.now()}-${Math.random()}`;
}
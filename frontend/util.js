function getCustomerId(){
       let customerId=localStorage.getItem("customerId");
     console.log(customerId);
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
const changeCarousel = (type,Position) => {

    
    let last = document.getElementsByClassName('carousel-'+type)[0].getElementsByClassName('current');
    let current =  document.getElementsByClassName('carousel-'+type)[0].getElementsByClassName('card'+Position)
    last[0].style.transition = "all 0.3s ease-out";  
    current[0].style.transition = "all 0.5s ease-out";  
    last[0].classList.remove("current");
    current[0].classList.add("current");

    let date = new Date(Date.now() + 86400000); //86400000ms = 1 jour
    date = date.toUTCString();

    document.cookie = "current"+type+"Carousel="+Position+"; path=/; expires=" + date+";SameSite=Strict";

}
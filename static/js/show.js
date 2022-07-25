const show = (card) => {
    leavingCard = card.parentNode.parentNode.parentNode;
    mainContent = document.getElementsByClassName('mainContent')[0]
    footer = document.getElementsByTagName("footer")[0]
    if (leavingCard.classList.contains("opened")) {
        card.innerHTML = "See More ↓";
        leavingCard.classList.remove("opened");
        mainContent.classList.remove("opened");
        footer.classList.remove("opened");
    } else {
        current = document.getElementsByClassName('leavingCard opened')
        if (current.length != 0) {
            current[0].getElementsByClassName("button")[0].innerHTML = "See More ↓";
            current[0].classList.remove("opened");
        }
        card.innerHTML = "See Less ↑";
        leavingCard.classList.add("opened")
        mainContent.classList.add("opened")
        footer.classList.add("opened")
    }
}
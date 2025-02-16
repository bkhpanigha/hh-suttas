const fetchFooter = () => {
  fetch("/footer.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById("footer").innerHTML = data;
    })
    .catch((error) => {
      console.error("Error fetching header:", error);
    });
};

if (window.innerWidth > 1000) {
  fetchFooter();
}

export default fetchFooter;

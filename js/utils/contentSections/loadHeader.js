const header = window.innerWidth < 1000 ? "/header-mobile.html" : "/header.html";

const fetchHeader = (location) => {
  fetch(location)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      // Insert the fetched content into the placeholder
      document.getElementById("header-placeholder").innerHTML = data;
    })
    .catch((error) => {
      console.error("Error fetching header:", error);
    });
};

fetchHeader(header);

export default fetchHeader;

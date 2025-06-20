const loadRightSidebar = () => {
  fetch("/right-sidebar.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById("right-sidebar-placeholder").innerHTML = data;
    })
    .catch((error) => {
      console.error("Error fetching sidebar:", error);
    });
};

if (window.innerWidth > 1000) {
  loadRightSidebar();
}

export default loadRightSidebar;

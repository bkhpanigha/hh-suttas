export default function activateTopButtonsTouchAnimation()
{
    //Only on touchscreen device
    if ("ontouchstart" in window || navigator.maxTouchPoints) {
        const buttons = document.querySelectorAll("#top-buttons .icon-button");

        buttons.forEach(button => {
            button.addEventListener("touchstart", function (e) {
                button.classList.add("active");
                e.preventDefault();
            });

            button.addEventListener("touchend", function () {
                button.classList.remove("active");
            });

            button.addEventListener("touchcancel", function () {
                button.classList.remove("active");
            });
        });
    }
}

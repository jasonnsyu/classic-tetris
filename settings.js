let slider = document.getElementById("range");
let value = document.querySelector(".value");
value.innerHTML = slider.value;

function calcValue() {
  valuePercentage = (slider.value / slider.max) * 100;
  slider.style.background = `linear-gradient(to right, #0A84FF ${valuePercentage}%, #ebe9e7 ${valuePercentage}%)`;
}

slider.addEventListener("input", function () {
  calcValue();
  value.textContent = this.value;
  gameSpeed = 1000 / this.value;

  const event = new CustomEvent("updateGameSpeed", { detail: { gameSpeed } });
  document.dispatchEvent(event);
});

calcValue();

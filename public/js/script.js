// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// for review
const stars = document.querySelectorAll("#starRating i");
  const ratingInput = document.querySelector("#ratingInput");

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const value = star.getAttribute("data-value");
      ratingInput.value = value;

      // Update star colors dynamically
      stars.forEach((s, index) => {
        if (index < value) {
          s.classList.remove("fa-regular");
          s.classList.add("fa-solid", "text-warning");
        } else {
          s.classList.remove("fa-solid", "text-warning");
          s.classList.add("fa-regular");
        }
      });
    });
  });
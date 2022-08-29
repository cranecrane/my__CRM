(() => {
  document.addEventListener('DOMContentLoaded', function() {
    const select = document.querySelectorAll('.select');

    select.forEach((el) => {
      const choices = new Choices(el, {
          searchEnabled: false,
          shouldSort: false,
      });
    })
  });
})()

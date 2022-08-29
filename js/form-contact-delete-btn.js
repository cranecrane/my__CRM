(() => {
  document.addEventListener('DOMContentLoaded', () => {
    tippy(document.querySelectorAll('.form-contact__delete-btn'), {
      content(reference) {
        const id = reference.getAttribute('data-template');
        const template = document.getElementById(id);
        return template.innerHTML;
      },
      allowHTML: true,
      theme: 'black',
    });
  });
})()

(() => {
  document.addEventListener('DOMContentLoaded', () => {
    tippy(document.querySelectorAll('.contact-btn'), {
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

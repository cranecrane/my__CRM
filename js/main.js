(() => {
  document.addEventListener('DOMContentLoaded', async () => {
    const emptyTableTemplate = `<tr class="clients-table__empty-row">
                                  <td colspan="7">
                                    <div class="clients-table__empty-content">
                                      <div class="clients-table__no-data-text">В таблице пока нет данных :(</div>
                                    </div>
                                  </td>
                                </tr>`;

    const container = document.getElementById('dataContainer');
    const addClientBtn = document.getElementById('addClientBtn');

    const toggleClass = (elClass, elemsArr) => {
      elemsArr.forEach((el) => {
        el.classList.toggle(elClass);
      });
    };
    // mode === 'show' || mode === 'hide'
    const smoothAppearance = (elem, mode) => {
      const duration = 300;
      let start = null;
      let opacity = mode === 'show' ? 0 : 1;

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;

        opacity = mode === 'show' ? opacity + .2 : opacity - .2;

        elem.style = `opacity: ${opacity}`;

        if (progress < duration) {
          window.requestAnimationFrame(step)
        } else {
          mode === 'hide' ? elem.remove() : false;
        }
      }
      window.requestAnimationFrame(step);
    };
    const normalizeDate = (data) => {
      let [day, time] = data.split('T');
      time = time.split(':', 2).join(':');

      return {
        day,
        time
      }
    };
    const createTooltips = (elemsClass) => {
      tippy(document.querySelectorAll(elemsClass), {
        content(reference) {
          const id = reference.getAttribute('data-template');
          const template = document.getElementById(id);
          return template.innerHTML;
        },
        allowHTML: true,
        theme: 'black',
      });
    };
    const createChoices = (container, selector) => {
      const select = container.querySelectorAll(selector);
      select.forEach((el) => {
        const choices = new Choices(el, {
            searchEnabled: false,
            shouldSort: false,
            allowHTML: true,
        });
      });
    };

    // mode === 'clientDataModal' || mode === 'clientDeleteModal'
    const createModal = async (mode, id = null, actionBtnsIconsArr = []) => {
      let data = null;
      if (mode === 'clientDataModal' && id) {
        const response = await fetch(`http://localhost:3000/api/clients/${id}`);
        data = await response.json();
      }

      console.log(data)

      const modalClassPrefix = mode === 'clientDataModal' ? 'client-data-modal' : 'delete-client-modal';
      const modalIconsHTML = {
        close: `<svg class="modal__close-icon" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.2333 1.73333L15.2667 0.766664L8.49997 7.53336L1.7333 0.766696L0.766637 1.73336L7.5333 8.50003L0.766664 15.2667L1.73333 16.2333L8.49997 9.46669L15.2666 16.2334L16.2333 15.2667L9.46663 8.50003L16.2333 1.73333Z" fill="currentColor"/>
                </svg>`,
        addContact: `<svg class="btn__icon--add-contact" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.99998 3.66683C6.63331 3.66683 6.33331 3.96683 6.33331 4.3335V6.3335H4.33331C3.96665 6.3335 3.66665 6.6335 3.66665 7.00016C3.66665 7.36683 3.96665 7.66683 4.33331 7.66683H6.33331V9.66683C6.33331 10.0335 6.63331 10.3335 6.99998 10.3335C7.36665 10.3335 7.66665 10.0335 7.66665 9.66683V7.66683H9.66665C10.0333 7.66683 10.3333 7.36683 10.3333 7.00016C10.3333 6.6335 10.0333 6.3335 9.66665 6.3335H7.66665V4.3335C7.66665 3.96683 7.36665 3.66683 6.99998 3.66683ZM6.99998 0.333496C3.31998 0.333496 0.333313 3.32016 0.333313 7.00016C0.333313 10.6802 3.31998 13.6668 6.99998 13.6668C10.68 13.6668 13.6666 10.6802 13.6666 7.00016C13.6666 3.32016 10.68 0.333496 6.99998 0.333496ZM6.99998 12.3335C4.05998 12.3335 1.66665 9.94016 1.66665 7.00016C1.66665 4.06016 4.05998 1.66683 6.99998 1.66683C9.93998 1.66683 12.3333 4.06016 12.3333 7.00016C12.3333 9.94016 9.93998 12.3335 6.99998 12.3335Z" fill="#9873FF"/>
                     </svg>`,
        spinner: `<svg class="hidden modal__submit-btn-icon spinner" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 20C2 29.941 10.059 38 20 38C29.941 38 38 29.941 38 20C38 10.059 29.941 2 20 2C17.6755 2 15.454 2.4405 13.414 3.243" stroke="currentColor" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round"/>
                </svg>`
      };
      const closeModal = () => {
        document.body.classList.remove('disable-scroll');
        smoothAppearance(modalElem, 'hide');
        document.removeEventListener('keydown', closeModalEsc);
      };
      const closeModalEsc = (event) => {
        if (event.keyCode === 27) closeModal();
      };

      //создаем общие элементы
      const modalElem = document.createElement('div');
      modalElem.id = 'modal';
      modalElem.classList.add(modalClassPrefix, 'modal');
      modalElem.addEventListener('click', (e) => {
        if (e.target === modalElem) closeModal();
      });
      document.addEventListener('keydown', closeModalEsc);

      const modalWindow = document.createElement('form');
      modalWindow.classList.add(`${modalClassPrefix}__window`, 'modal__window');
      modalWindow.tabIndex = '0';

      const closeModalBtn = document.createElement('button');
      closeModalBtn.type = 'button';
      closeModalBtn.classList.add(`${modalClassPrefix}__close-btn`, 'modal__close-btn', 'btn-reset')
      closeModalBtn.innerHTML = modalIconsHTML.close;
      closeModalBtn.addEventListener('click', () => closeModal());

      const modalTitle = document.createElement('h3');
      modalTitle.classList.add(`${modalClassPrefix}__title`, 'modal__title');

      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.classList.add(`${modalClassPrefix}__submit-btn`, 'modal__submit-btn', 'btn--primary', 'btn', 'btn-reset');
      submitBtn.innerHTML += modalIconsHTML.spinner;

      const rejectBtn = document.createElement('button');
      rejectBtn.type = 'button';
      rejectBtn.classList.add(`${modalClassPrefix}__reject-btn`, 'modal__reject-btn', 'btn-reset');
      rejectBtn.textContent = data && mode === 'clientDataModal' ? 'Удалить клиента': 'Отмена';
      rejectBtn.addEventListener('click', () => {
        closeModal();
        if (id && mode === 'clientDataModal') createModal('clientDeleteModal', id);
      });

      //поведение блока для mode === 'clientDataModal'
      //если id === null, то показываем форму для создания нового клиента
      //если id передан, то показываем форму для редактирования данных клиента
      if (mode === 'clientDataModal') {
        const deleteContactBtnDataset = 'delete-btn-template';
        const inputFocus = (el) => el.parentElement.classList.remove('empty');
        const inputBlur = (el) => el.value === '' ? el.parentElement.classList.add('empty') : el.parentElement.classList.remove('empty');
        const createFormContact = (index, contactData = null) => {
          const classPrefix = 'form-contact';
          const selectInnerTemplate = `<option>Телефон</option>
                                      <option>Email</option>
                                      <option>Vk</option>
                                      <option>Facebook</option>
                                      <option>Другое</option>`;
          const deleteBtnIconHTML = `<svg class="${classPrefix}__delete-icon" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z" fill="currentColor"/>
                                    </svg>`;

          const contactElem = document.createElement('div');
          const typeElem = document.createElement('div');
          const typeSelect = document.createElement('select');
          const valueElem = document.createElement('input');
          const deleteContactBtn = document.createElement('button');

          contactElem.classList.add(`${modalClassPrefix}__contact`, classPrefix);
          typeElem.classList.add(`${classPrefix}__type`);
          typeSelect.classList.add('select');
          typeSelect.innerHTML = selectInnerTemplate;
          typeSelect.id = `client-contact-${index}`;
          if (contactData) {
            typeSelect.value = contactData.type
          };
          valueElem.type = 'text';
          valueElem.id = `contact-value-${index}`;
          valueElem.classList.add(`${classPrefix}__value`);
          valueElem.placeholder = 'Введите данные';
          if (contactData) valueElem.value = contactData.value;
          valueElem.addEventListener('input', (e) => {
            e.currentTarget.classList.remove('warning');
            deleteContactBtn.classList.remove('hidden');
          });
          deleteContactBtn.type = 'button';
          deleteContactBtn.classList.add(`${classPrefix}__delete-btn`, 'hidden');
          deleteContactBtn.classList.toggle('hidden', !valueElem.value);
          deleteContactBtn.ariaLabel = 'Удалить контакт';
          deleteContactBtn.dataset.template = deleteContactBtnDataset;
          deleteContactBtn.innerHTML = deleteBtnIconHTML;
          deleteContactBtn.addEventListener('click', () => {
            contactElem.remove();
            if (contactsContainer.childElementCount === 0) {
              contactsBlock.classList.add('empty')
            } else if (contactsContainer.childElementCount < 10) {
              addContactBtn.classList.remove('hidden');
            };
          });

          typeElem.append(typeSelect);
          contactElem.append(typeElem, valueElem, deleteContactBtn);
          return contactElem;
        }

        const formHeader = document.createElement('div');
        formHeader.classList.add(`${modalClassPrefix}__form-header`);

        modalTitle.textContent = id ? 'Изменить данные' : 'Новый клиент';

        const clientId = document.createElement('span');
        clientId.classList.add(`${modalClassPrefix}__client-id`);
        clientId.innerHTML = id ? `ID: ${data.id}` : null;

        const inputsContainer = document.createElement('div');
        inputsContainer.classList.add(`${modalClassPrefix}__form-inputs`);

        const clientSurnameBlock = document.createElement('label');
        const clientNameBlock = document.createElement('label');
        const clientLastnameBlock = document.createElement('label');

        const clientSurnameLabel = document.createElement('span');
        const clientNameLabel = document.createElement('span');
        const clientLastnameLabel = document.createElement('span');

        const clientSurnameInput = document.createElement('input');
        const clientNameInput = document.createElement('input');
        const clientLastnameInput = document.createElement('input');

        clientSurnameLabel.textContent = 'Фамилия';
        clientNameLabel.textContent = 'Имя';
        clientLastnameLabel.textContent = 'Отчество';

        clientSurnameLabel.classList.add('input__label', 'input__label--required');
        clientNameLabel.classList.add('input__label', 'input__label--required');
        clientLastnameLabel.classList.add('input__label');

        clientSurnameBlock.classList.add(`${modalClassPrefix}__input`, 'input');
        clientNameBlock.classList.add(`${modalClassPrefix}__input`, 'input');
        clientLastnameBlock.classList.add(`${modalClassPrefix}__input`, 'input');

        if (!id) {
          clientSurnameBlock.classList.add('empty');
          clientNameBlock.classList.add('empty');
          clientLastnameBlock.classList.add('empty');
        } else {
          clientSurnameInput.value = data.surname;
          clientNameInput.value = data.name;
          clientLastnameInput.value = data.lastName;
        }

        clientSurnameInput.for = 'clientSurname';
        clientNameInput.for = 'clientName';
        clientLastnameInput.for = 'clientLastname';

        clientSurnameInput.classList.add('input__elem');
        clientNameInput.classList.add('input__elem');
        clientLastnameInput.classList.add('input__elem');
        clientSurnameInput.id = 'clientSurname';
        clientNameInput.id = 'clientName';
        clientLastnameInput.id = 'clientLastname';
        clientSurnameInput.type = 'text';
        clientNameInput.type = 'text';
        clientLastnameInput.type = 'text';

        clientSurnameInput.required = true;
        clientNameInput.required = true;

        clientSurnameInput.addEventListener('focus', (e) => {
          e.currentTarget.classList.remove('warning');
          inputFocus(e.currentTarget)
        });
        clientSurnameInput.addEventListener('blur', (e) => inputBlur(e.currentTarget));

        clientNameInput.addEventListener('focus', (e) => {
          e.currentTarget.classList.remove('warning');
          inputFocus(e.currentTarget)
        });
        clientNameInput.addEventListener('blur', (e) => inputBlur(e.currentTarget));

        clientLastnameInput.addEventListener('focus', (e) => {
          e.currentTarget.classList.remove('warning');
          inputFocus(e.currentTarget)
        });
        clientLastnameInput.addEventListener('blur', (e) => inputBlur(e.currentTarget));

        const contactsBlock = document.createElement('div');
        contactsBlock.classList.add(`${modalClassPrefix}__contacts-block`);
        contactsBlock.classList.toggle('empty', !(data && data.contacts.length));

        const contactsContainer = document.createElement('div');
        contactsContainer.classList.add(`${modalClassPrefix}__contacts`);
        if (data && data.contacts) {
          data.contacts.forEach((el, index) => contactsContainer.append(createFormContact(index, el)));
          createChoices(contactsContainer, '.select');
        }

        const addContactBtn = document.createElement('button');
        addContactBtn.type = 'button';
        addContactBtn.classList.add(`${modalClassPrefix}__add-contact-btn`, 'btn', 'btn-reset');
        addContactBtn.innerHTML = modalIconsHTML.addContact + 'Добавить контакт';
        addContactBtn.addEventListener('click', () => {
          const index = contactsContainer.childElementCount;
          contactsBlock.classList.remove('empty');
          contactsContainer.append(createFormContact(index));
          createChoices(contactsContainer, `#client-contact-${index}`);
          if (index === 9) addContactBtn.classList.add('hidden');
        });

        const deleteContactTooltipContent = document.createElement('div');
        deleteContactTooltipContent.classList.add(`tippy__content`);
        deleteContactTooltipContent.id = deleteContactBtnDataset;
        deleteContactTooltipContent.innerHTML = 'Удалить контакт';

        const validError = document.createElement('div');
        validError.classList.add(`${modalClassPrefix}__valid-error`, 'hidden');

        submitBtn.innerHTML += 'Сохранить';
        submitBtn.addEventListener('click', async (e) => {
          const toValidateForm = () => {
            const errorMessages = {
              required: 'Заполните обязательные поля',
              emptyContact: 'Заполните значения для всех контактов'
            };
            const requiredData = inputsContainer.querySelectorAll(`.input__elem[required]`);
            const contactsData = contactsContainer.querySelectorAll('.form-contact__value');
            let errorText = '';
            let requiredState = true;
            let contactsState = true;

            requiredData.forEach((el) => {
              if (!el.value.trim()) {
                requiredState = false;
                el.classList.add('warning');
              }
            });
            contactsData.forEach((el) => {
              if (!el.value.trim()) {
                contactsState = false;
                el.classList.add('warning');
              }
            });
            if (!requiredState) errorText = errorMessages.required;
            if (!contactsState) errorText += `<br> ${errorMessages.emptyContact}`;

            validError.innerHTML = errorText;
            validError.classList.toggle('hidden', !errorText);
            return !Boolean(errorText);
          };
          const getContactsObj = () => {
            const result = [];
            const contacts = contactsContainer.querySelectorAll('.form-contact');

            contacts.forEach((e) => {
              const value = e.querySelector('.form-contact__value').value;
              const type = e.querySelector('select').value;
              result.push({type: type, value: value});
            });
            return result;
          };
          const normalizeTextData = (str) => {
            str = str.trim();
            return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
          };
          const request = async (data) => {
            const requestMethod = id ? 'PATCH' : 'POST';
            let path = 'http://localhost:3000/api/clients/';
            if (id) path += id;

            const response = await fetch(path, {
              method: requestMethod,
              body: JSON.stringify(data),
              headers: {
                'Content-type': 'application/json',
              }
            });
            return response;
          };
          const toShowRequestStatus = async (response) => {
            const status = response.status;
            const message = await response.json();

            if (status === 422 || status === 404 || String(status).startsWith('5')) {
              validError.textContent = `Ошибка ${status}: ${message}`
              validError.classList.remove('hidden');
            } else if (response.ok) {
              id ? document.getElementById(data.id).replaceWith(createTableRow(message)) : container.append(createTableRow(message));
              createTooltips('.contact-btn');
              closeModal();
            }
          };
          const newClientData = {
            name: normalizeTextData(clientNameInput.value),
            surname: normalizeTextData(clientSurnameInput.value),
            lastName: normalizeTextData(clientLastnameInput.value),
            contacts: getContactsObj()
          };

          e.preventDefault();

          if (toValidateForm()) {
            submitBtn.children[0].classList.remove('hidden');
            toShowRequestStatus(await request(newClientData))
          };
        });

        clientSurnameBlock.append(clientSurnameLabel, clientSurnameInput);
        clientNameBlock.append(clientNameLabel, clientNameInput);
        clientLastnameBlock.append(clientLastnameLabel, clientLastnameInput);
        inputsContainer.append(clientSurnameBlock, clientNameBlock, clientLastnameBlock);
        contactsBlock.append(contactsContainer, addContactBtn);

        id ? formHeader.append(modalTitle, clientId) : formHeader.append(modalTitle);
        modalWindow.append(formHeader, inputsContainer, contactsBlock, deleteContactTooltipContent, validError, submitBtn, rejectBtn);
      } else if (mode === 'clientDeleteModal' && id) {
        //поведение блока для mode === 'clientDeleteModal'
        modalTitle.textContent = 'Удалить клиента';

        const deleteDescr = document.createElement('p');
        deleteDescr.textContent = 'Вы действительно хотите удалить данного клиента?'
        deleteDescr.classList.add(`${modalClassPrefix}__descr`);

        submitBtn.innerHTML += 'Удалить';
        submitBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          submitBtn.children[0].classList.remove('hidden');

          await fetch(`http://localhost:3000/api/clients/${id}`, {
            method: 'DELETE',
          });
          document.getElementById(id).remove();
          closeModal();
        });
        modalWindow.append(modalTitle, deleteDescr, submitBtn, rejectBtn);
      }

      modalWindow.prepend(closeModalBtn);
      modalElem.append(modalWindow);
      document.body.append(modalElem);
      createTooltips('.form-contact__delete-btn');
      document.body.classList.add('disable-scroll');
      smoothAppearance(modalElem, 'show');
      modalWindow.focus()
      toggleClass('hidden', actionBtnsIconsArr);
    }

    const createContact = (data, id, index, container) => {
      const iconsHTML = {
        'Vk': `<svg class="contact-btn__icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill="#9873FF"/>
              </svg>`,
        'Другое': `<svg class="contact-btn__icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#9873FF"/>
                   </svg>`,
        'Телефон': `<svg class="contact-btn__icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="8" fill="#9873FF"/>
                      <path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/>
                    </svg>`,
        'Email': `<svg class="contact-btn__icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill="#9873FF"/>
                  </svg>`,
        'Facebook': `<svg class="contact-btn__icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill="#9873FF"/>
                     </svg>`,
      };
      const contactBtn = document.createElement('button');
      const dataContainer = document.createElement('div');
      const typeElem = document.createElement('span');
      const valueElem = document.createElement('span');

      contactBtn.type = 'button';
      contactBtn.ariaLabel = data.type;
      contactBtn.dataset.template = `${id}-${data.type}-${index}`;
      contactBtn.classList.add('contact-btn', 'btn-reset');
      contactBtn.innerHTML = iconsHTML[data.type];

      dataContainer.id = `${id}-${data.type}-${index}`;
      typeElem.classList.add('contact-btn__tooltip--type');
      typeElem.textContent = data.type + ': ';
      valueElem.classList.add('contact-btn__tooltip--value');
      valueElem.textContent = data.value;

      dataContainer.append(typeElem, valueElem);
      container.append(dataContainer);

      return contactBtn;
    };
    const createContactsGroup = (data, id, container) => {
      const contactsContentContainer = document.createElement('div');
      const visibleContactsCount = 4;

      contactsContentContainer.classList.add('tippy__content');

      data.slice(0, visibleContactsCount).forEach((el, index) => container.append(createContact(el, id, index, contactsContentContainer)));
      if (data.length > visibleContactsCount) {
        const restContactsElement = document.createElement('button');

        restContactsElement.type = 'button';
        restContactsElement.classList.add('contact-btn__rest', 'btn-reset');
        restContactsElement.textContent = `+${data.length - visibleContactsCount}`;

        container.append(restContactsElement);
        restContactsElement.addEventListener('click', () => {
          container.innerHTML = '';
          data.forEach(el => container.append(createContact(el, id, contactsContentContainer)));
          container.append(contactsContentContainer)
          createTooltips('.contact-btn');
        });
      }
      container.append(contactsContentContainer);
    };
    const createTableRow = ({id, lastName, name, surname, createdAt, updatedAt, contacts}) => {
      const rowClass = 'clients-table__row';
      const colClass = 'clients-table__td';
      const timeElemClass = 'clients-table__time';

      const iconsHTML = {
        'Изменить': `<svg class="action-btn__icon" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 10.5002V13.0002H2.5L9.87333 5.62687L7.37333 3.12687L0 10.5002ZM11.8067 3.69354C12.0667 3.43354 12.0667 3.01354 11.8067 2.75354L10.2467 1.19354C9.98667 0.933535 9.56667 0.933535 9.30667 1.19354L8.08667 2.41354L10.5867 4.91354L11.8067 3.69354Z" fill="currentColor"/>
                     </svg>`,
        'Удалить': `<svg class="action-btn__icon" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z" fill="currentColor"/>
                    </svg>`,
        'Спиннер': `<svg class="hidden action-btn__spinner action-btn__icon spinner" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 20C2 29.941 10.059 38 20 38C29.941 38 38 29.941 38 20C38 10.059 29.941 2 20 2C17.6755 2 15.454 2.4405 13.414 3.243" stroke="currentColor" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round"/>
                    </svg>`,
      }

      const createdDate = normalizeDate(createdAt);
      const updatedDate = normalizeDate(updatedAt);

      const rowElem = document.createElement('tr');
      const idCol = document.createElement('td');
      const nameCol = document.createElement('td');
      const createdCol = document.createElement('td');
      const updatedCol = document.createElement('td');
      const contactsCol = document.createElement('td');
      const actionsCol = document.createElement('td');

      const createdDay = document.createElement('time');
      const createdTime = document.createElement('time');
      const updatedDay = document.createElement('time');
      const updatedTime = document.createElement('time');
      const contactsContainer = document.createElement('div');
      const actionsContainer = document.createElement('div');
      const actionsBtnEdit = document.createElement('button');
      const actionsBtnDelete = document.createElement('button');

      rowElem.id = id;
      rowElem.classList.add(rowClass);
      idCol.classList.add(`${colClass}--id`, colClass);
      nameCol.classList.add(`${colClass}--name`, colClass);
      createdCol.classList.add(`${colClass}--date`, colClass);
      updatedCol.classList.add(`${colClass}--date`, colClass);
      contactsCol.classList.add(`${colClass}--contacts`, colClass);
      actionsCol.classList.add(`${colClass}--actions`, colClass);

      createdDay.datetime = createdDate.day;
      createdTime.datetime = createdDate.time;
      createdTime.classList.add(timeElemClass);
      updatedDay.datetime = updatedDate.day;
      updatedTime.datetime = updatedDate.time;
      updatedTime.classList.add(timeElemClass);

      contactsContainer.classList.add('clients-table__contacts-container');
      actionsContainer.classList.add('clients-table__actions-container');
      actionsBtnEdit.classList.add('action-btn--edit', 'action-btn', 'btn-reset');
      actionsBtnDelete.classList.add('action-btn--delete', 'action-btn', 'btn-reset');

      idCol.textContent = id;
      nameCol.textContent = surname + ' ' + name + ' ' + lastName;
      createdDay.textContent = createdDate.day.split('-').reverse().join('.');
      createdTime.textContent = createdDate.time;
      updatedDay.textContent = updatedDate.day.split('-').reverse().join('.');
      updatedTime.textContent = updatedDate.time;

      createContactsGroup(contacts, id, contactsContainer);

      actionsBtnEdit.type = 'button';
      actionsBtnDelete.type = 'button';
      actionsBtnEdit.innerHTML = iconsHTML['Изменить'] + iconsHTML['Спиннер'] + '<span>Изменить</span>';
      actionsBtnDelete.innerHTML = iconsHTML['Удалить'] + iconsHTML['Спиннер'] + '<span>Удалить</span>';

      actionsBtnEdit.addEventListener('click', (e) => {
        toggleClass('hidden', [e.currentTarget.children[0], e.currentTarget.children[1]]);
        createModal('clientDataModal', id, [e.currentTarget.children[0], e.currentTarget.children[1]]);
      });
      actionsBtnDelete.addEventListener('click', (e) => {
        toggleClass('hidden', [e.currentTarget.children[0], e.currentTarget.children[1]]);
        createModal('clientDeleteModal', id, [e.currentTarget.children[0], e.currentTarget.children[1]]);
      });

      createdCol.append(createdDay, createdTime);
      updatedCol.append(updatedDay, updatedTime);
      contactsCol.append(contactsContainer);
      actionsContainer.append(actionsBtnEdit, actionsBtnDelete);
      actionsCol.append(actionsContainer);
      rowElem.append(idCol, nameCol, createdCol, updatedCol, contactsCol, actionsCol);

      return rowElem;
    };
    const createTableBody = (data, bodyElem) => {
      if (!data.length) {
        bodyElem.innerHTML = emptyTableTemplate;
      } else {
        bodyElem.innerHTML = '';
      }
      data.forEach((el) => bodyElem.append(createTableRow(el)));
      createTooltips('.contact-btn');
    };
    const getClientsData = async() => {
      const response = await fetch('http://localhost:3000/api/clients');
      const clients = await response.json();
      return clients;
    }

    createTableBody(await getClientsData(), container);
    addClientBtn.addEventListener('click', () => createModal('clientDataModal'));
  });
})()

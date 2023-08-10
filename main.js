class View {
  constructor(api) {
    this.app = document.getElementById("app");
    this.api = api;
    this.searhLine = this.createElement("div", "search");
    this.searhInput = this.createElement("input", "search__input");
    this.searhLine.append(this.searhInput);
    this.noneUser = this.createElement("span", "main__noneUser");
    this.main = this.createElement("div", "main");
    this.list = this.createElement("ul", "main__list");
    this.main.append(this.list);
    this.app.append(this.searhLine);
    this.searhLine.append(this.noneUser);
    this.app.append(this.main);
  }
  createElement(elementTag, elementClass) {
    const element = document.createElement(elementTag);
    if (elementClass) {
      element.classList.add(elementClass);
    }
    return element;
  }
  creatUser(userData) {
    const userElem = this.createElement("li", "main__user");
    userElem.addEventListener("click", () => this.moveUser(userData));
    userElem.addEventListener("click", () => {
      this.list.remove();
    });

    userElem.innerHTML = `<span class="main__text">${userData.name}</span>`;

    this.list.append(userElem);
    this.searhLine.append(this.list);
  }
  moveUser(user) {
    console.log(user);
    const userContainer = this.createElement("div", "ResultList");
    this.main.append(userContainer);
    const close = this.createElement("div", "ResultList__closeModal");
    userContainer.append(close);

    const userEl = this.createElement("ul", "ResultList__sp");

    const data = this.api.moveUserData(user).then((res) => {
      userEl.innerHTML =
        `<li class ='ResultList__list'> Name: ${user.name}</li>` +
        `<li class ='ResultList__list'> Owner: ${user.owner.login}</li>` +
        `<li class ='ResultList__list'> Stars: ${user.stargazers_count}</li>`;
    });
    close.addEventListener("click", () => {
      userContainer.remove();
    });
    this.searhInput.value = "";

    userContainer.append(userEl);
  }
}
class Search {
  constructor(view, api) {
    this.api = api;
    this.view = view;
    this.view.searhInput.addEventListener(
      "input",
      this.debounce(this.searhUsers.bind(this), 500)
    );
  }

  searhUsers() {
    if (this.view.searhInput.value) {
      this.clearUsers();
      this.usersRequest(this.view.searhInput.value);
    } else {
      this.clearUsers();
    }
  }
  usersRequest(searchValue) {
    this.api.loadUsers(searchValue).then((res) => {
      if (res.ok) {
        res.json().then((res) => {
          if (res.total_count === 0) {
            this.view.noneUser.textContent = "Пользователей не найдено";
          } else {
            this.view.noneUser.textContent = "";
          }

          res.items.forEach((element) => {
            this.view.creatUser(element);
          });
        });
      } else {
      }
    });
  }

  clearUsers() {
    this.view.list.innerHTML = "";
  }
  debounce(func, wait, immediate) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
}
const URL = "https://api.github.com/";

class Api {
  async loadUsers(value) {
    return await fetch(`${URL}search/repositories?q=${value}&per_page=5`);
  }
  moveUserData(user) {
    const urls = [`${URL}users/${user.name}`];
    const request = urls.map((url) => fetch(url));
    return Promise.all(request).then((responses) =>
      Promise.all(responses.map((r) => r.json()))
    );
  }
}
const api = new Api();
const app = new Search(new View(api), api);

// const noneUser = this.createElement("li", "main__noneUser");
//       noneUser.innerHTML = `<span class="main__noneText">Пользователь</span>`;
//       this.list.append(noneUser);
//       this.searhLine.append(this.list);

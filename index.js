const stateDefault = {
  owner: '',
  location: '',
  questionList: {},
  answers: {},
}
let userNow = ''
const componentList = [
  'header',
  'toolbar',
  'questionList',
  'footer',
]
const loginData = {
  userData: '',
  passwordData: '',
}
const stateKeysList = ['questionList', 'answers']
const root = document.getElementById('app')
let state = {}
stateKeysList.map(() => {
  if (localStorage.getItem('state')) {
    state = JSON.parse(localStorage.getItem('state'))
  } else {
    state = stateDefault
  }
})

function loginRequest(reqData) {
  const url =
    'https://rsvisualstudio.ru/kamishibai/backend/main.php'
  const data = `req=login&user=${reqData.userData}&password=${reqData.passwordData}`
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest()
    req.open('post', url)
    req.setRequestHeader(
      'Content-Type',
      'application/x-www-form-urlencoded'
    )
    req.onload = function () {
      loaderOn()
      if (req.status == 200) {
        resolve(req.response)
      } else {
        reject(Error(req.statusText))
      }
    }
    req.onerror = function () {
      reject(Error('Network Error'))
    }
    req.send(data)
  }).then(
    result => {
      loaderOff()
      result = result.replace(/"/g, '')
      if (result == 'coockiesWasNotSetted') {
        makeAlert('Вы ввели неверные данные')
        createAuthFormEventListeners()
      } else {
        deleteAuthForm()
        makeAlert('Вы авторизовались')
        location.reload()
      }
    },
    error => {
      makeAlert(error)
    }
  )
}

function getQuestionsRequest(user) {
  const url =
    'https://rsvisualstudio.ru/kamishibai/backend/main.php'
  const data = `req=getQuestions&user=${user}`
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest()
    req.open('post', url)
    req.setRequestHeader(
      'Content-Type',
      'application/x-www-form-urlencoded'
    )
    req.onload = function () {
      loaderOn()
      if (req.status == 200) {
        resolve(req.response)
      } else {
        reject(Error(req.statusText))
      }
    }
    req.onerror = function () {
      reject(Error('Network Error'))
    }
    req.send(data)
  }).then(
    result => {
      loaderOff()
      const questions = JSON.parse(result)
      if (questions == 'todayalreadyanswered') {
        makeAlert(
          'Вы сегодня уже проводили аудит, зайдите в приложение завтра'
        )
      } else {
        questions.map((q, index) => {
          addToState(state, 'questionList', q, index)
        })
        addToState(
          state,
          'location',
          questions[0].location,
          0
        )
        addToState(state, 'owner', user, 0)
        makeQuestionList(state)
      }
    },
    error => {
      makeAlert(error)
    }
  )
}

function sendAnswerRequest() {
  const url =
    'https://rsvisualstudio.ru/kamishibai/backend/main.php'
  const answers = JSON.stringify(
    JSON.parse(localStorage.getItem('state')).answers
  )
  const data = `req=insertAnswers&answers=${answers}`
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest()
    req.open('post', url)
    req.setRequestHeader(
      'Content-Type',
      'application/x-www-form-urlencoded'
    )
    req.onload = function () {
      loaderOn()
      if (req.status == 200) {
        resolve(req.response)
      } else {
        reject(Error(req.statusText))
      }
    }
    req.onerror = function () {
      reject(Error('Network Error'))
    }
    req.send(data)
  }).then(
    result => {
      makeAlert(
        'Спасибо! Вы провели аудит! На сегодня все, приходите завтра'
      )
      localStorage.clear()
      document.getElementById('header').remove()
    },
    error => {
      makeAlert(error)
    }
  )
}

function logoutRequest() {
  const url =
    'https://rsvisualstudio.ru/kamishibai/backend/main.php'
  const data = `req=logout`
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest()
    req.open('post', url)
    req.setRequestHeader(
      'Content-Type',
      'application/x-www-form-urlencoded'
    )
    req.onload = function () {
      loaderOn()
      if (req.status == 200) {
        resolve(req.response)
      } else {
        reject(Error(req.statusText))
      }
    }
    req.onerror = function () {
      reject(Error('Network Error'))
    }
    req.send(data)
  }).then(
    result => {
      localStorage.clear()
      location.reload()
    },
    error => {
      makeAlert(error)
    }
  )
}

function initialization() {
  makeTemplate(componentList)
  createFooter()
  if (localStorage.getItem('state') === null) {
    updateState()
    location.reload()
  } else if (
    Object.keys(
      JSON.parse(localStorage.getItem('state')).questionList
    ).length == 0
  ) {
    console.log('2')
    const url =
      'https://rsvisualstudio.ru/kamishibai/backend/main.php'
    const data = `req=check`
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest()
      req.open('post', url)
      req.setRequestHeader(
        'Content-Type',
        'application/x-www-form-urlencoded'
      )
      req.onload = function () {
        loaderOn()
        if (req.status == 200) {
          resolve(req.response)
        } else {
          reject(Error(req.statusText))
        }
      }
      req.onerror = function () {
        reject(Error('Network Error'))
      }
      req.send(data)
    }).then(
      result => {
        loaderOff()
        result = result.replace(/"/g, '')
        if (result == 'userIsNotAuthorized') {
          createAuthorizationForm()
          createAuthFormEventListeners()
        } else {
          getQuestionsRequest(result)
        }
      },
      error => {}
    )
  } else {
    makeQuestionList(state)
  }
}

function makeTemplate(componentList) {
  const cL = componentList
  const id = 'app'
  cL.map(el => {
    let div = `<div id='${el}'></div>`
    addElToHtml(id, div)
  })
}

function addElToHtml(id, el) {
  document.getElementById(id).innerHTML += el
}

function addToState(state, place, el, id) {
  if (state[place]) {
    state[place][id] = el
  } else {
    state[place] = {}
    state[place][id] = el
  }
  updateState()
}

function removeFromState(state, place, id) {
  if (Object.keys(state[place]).indexOf(id)) {
  }
  delete state[place][id]
  updateState()
}

function updateState() {
  newState = JSON.stringify(state)
  Object.keys(state).map(el => {
    localStorage.setItem('state', newState)
  })
}

function doneQuestion(question, el) {
  const answeredQuestion = [
    el.target.dataset.text,
    el.target.dataset.btntype,
    el.target.dataset.location,
    el.target.dataset.typeaudit,
  ]
  document.getElementById(question).remove()
  removeFromState(state, 'questionList', question)
  addToState(
    state,
    'answers',
    answeredQuestion,
    el.target.dataset.questionid
  )
  if (Object.keys(state.questionList).length == 0) {
    const answers = JSON.stringify(state.answers)
    sendAnswerRequest(answers)
  }
}

function deleteAlert() {
  document.getElementById('alert').remove()
}

function deleteAuthForm() {
  document.getElementById('authForm').remove()
}

function makeQuestionList(state) {
  const rootId = 'questionList'
  const questionListUl = `<ul id='questionListUl' class='checklist-container'></ul>`
  addElToHtml(rootId, questionListUl)
  for (id in state.questionList) {
    const question = `
            <li id='${id}' class='checklist-container-unit' data-type='question'>
                        <div class='checklist-container-unit-question'>
                            ${state.questionList[id].question}
                        </div>
                        <div class='checklist-container-unit-btngrp'>
                            <div id='yes-${id}' class="checklist-container-unit-button yes" data-questionid='${id}' data-type='questionbtn' data-btntype='yes' data-text='${state.questionList[id].question}' data-location='${state.questionList[id].location}' data-typeaudit='${state.questionList[id].type}'>
                                Да
                            </div>
                            <div id='no-${id}'class="checklist-container-unit-button no" data-questionid='${id}' data-type='questionbtn' data-btntype='no' data-text='${state.questionList[id].question}' data-location='${state.questionList[id].location}' data-typeaudit='${state.questionList[id].type}'>
                                Нет
                            </div>
                        </div>
                    </li>`
    addElToHtml('questionListUl', question)
    addToState(
      state,
      'questionList',
      state.questionList[id],
      id
    )
  }
  const bottom =
    '<div class="checklist-container-bottom"></div>'
  addElToHtml('questionListUl', bottom)
  createQuestionsEventListeners()
  createHeader(state)
}

function makeAlert(alert) {
  const body = `
  <div id='alert' class='modal'>
    <div class='alert-body'>
      <div class='alert-body-text'>
      ${alert}
      </div>
      <div id='alert-body-button' class='alert-body-button' data-type='alert'>
      Закрыть
      </div>
    </div>
  </div>
  `
  document.getElementById('app').innerHTML += body
  document
    .getElementById('alert-body-button')
    .addEventListener('click', () => deleteAlert())
}

function loaderOn() {
  document.getElementById('loader').classList.add('active')
}

function loaderOff() {
  document
    .getElementById('loader')
    .classList.remove('active')
}

function createAuthorizationForm() {
  const body = `
    <div id='authForm' class='modal'>
    <div class='auth'>
      <div class='auth-header'>
      Войти в систему Kamishibai Audits</div>
      <div class='auth-body'>
        <div class='auth-body-form'>
          <p class='auth-body-form-label'>Укажите ваш логин</p>
          <input
            id='authUserInput'
            type='text'
            class='auth-body-form-input'
            id='user'
            placeholder='логин'
          />
        </div>
        <div class='auth-body-form'>
          <p class='auth-body-form-label'>Укажите пароль</p>
          <input
            id='authPasswordInput'
            type='password'
            class='auth-body-form-input'
            id='password'
            placeholder='пароль'
          />
        </div>
        <button
        id = 'authButton'
          type='submit'
          class='auth-button'
        >
          Войти
        </button>
      </div>
    </div>
  </div>
  `
  loginData.userData = ''
  loginData.passwordData = ''
  document.getElementById('app').innerHTML += body
}

function createHeader(state) {
  const header = `
  <div class='header'>
  <div class='header-bottomline'></div>
  <img class='header-img' src="./src/img/logoVerallia.jpg" alt=""/>
  <div class='header-text'>
  <h3>Добрый день ${state.owner[0]}!</h3>
  <p>Сегодня вам необходимо провести аудит на участке <strong>${state.location[0]}</strong></p>
  </div>
  </div>`
  addElToHtml('header', header)
}

function createFooter() {
  const footer = `
  <div id='footer' class='footer'>
  <div id='footer-button' onclick='logoutRequest()'>Выйти из приложения</div>
  </div>`
  addElToHtml('footer', footer)
}

function createAuthFormEventListeners() {
  loginData.userData = ''
  loginData.passwordData = ''
  document
    .getElementById('authButton')
    .addEventListener('click', () => {
      loginData.userData = document.getElementById(
        'authUserInput'
      ).value
      loginData.passwordData = document.getElementById(
        'authPasswordInput'
      ).value
      loginRequest(loginData)
    })

  // document
  //   .getElementById('authUserInput')
  //   .addEventListener('input', e => {
  //     loginData.userData += e.data
  //     console.log(loginData)
  //   })
  // document
  //   .getElementById('authPasswordInput')
  //   .addEventListener('input', e => {
  //     loginData.passwordData += e.data
  //     console.log(loginData)
  //   })
}

function createQuestionsEventListeners() {
  document
    .getElementById('questionList')
    .addEventListener('click', el => {
      if (el.target.dataset.type === 'questionbtn') {
        doneQuestion(el.target.dataset.questionid, el)
      }
    })
}

initialization()

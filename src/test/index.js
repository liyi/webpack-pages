import './style.scss'

let main = document.getElementById('main')

let component = require('./component.art')
main.innerHTML = component({ msg: 'hello, world' })

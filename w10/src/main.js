import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

// Mount the root component into the placeholder div in index.html.
const app = mount(App, {
  target: /** @type {HTMLElement} */ (document.getElementById('app')),
})

export default app

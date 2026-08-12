import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // same as credentials: 'include' — sends the session cookie
})

export default api

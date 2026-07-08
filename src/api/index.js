import * as mock from './mockApi'
import * as real from './realApi'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const api = USE_MOCK ? mock : real

export default api

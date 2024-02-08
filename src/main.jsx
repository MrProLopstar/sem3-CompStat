import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import store from './store/reducers.jsx';
import { setStory } from './store/router.jsx';
import '@vkontakte/vkui/dist/vkui.css';
import './App.css';

export default store;
export const {dispatch, getState} = store;
dispatch(setStory(['labs','lab1']));

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App/>
  </Provider>
)

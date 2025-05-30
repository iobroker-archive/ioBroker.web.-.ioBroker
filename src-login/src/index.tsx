import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import Login from './Login';
import * as serviceWorker from './serviceWorker';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Login />);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

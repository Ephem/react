import React, {Suspense} from 'react';
import {Route, Switch} from 'react-router-dom';
import logo from './react.svg';
import Home from './Home';
import Film from './Film';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>React-Apollo-Hooks Example</h1>
      </div>
      <Suspense
        fallback={<section className="App-container">Loading...</section>}>
        <Switch>
          <Route exact={true} path="/" component={Home} />
          <Route
            path="/:title"
            render={({match}) => (
              <Film title={match.params.title.replace(/-/g, ' ')} />
            )}
          />
        </Switch>
      </Suspense>
    </div>
  );
}

export default App;

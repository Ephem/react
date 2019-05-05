import {
  combineReducers,
  createStore as createReduxStore,
  applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';
import {articleListReducer} from './Home';
import {articleReducer} from './Article';

const reducer = combineReducers({
  articleList: articleListReducer,
  articles: articleReducer,
});

export default function createStore(initialState) {
  return createReduxStore(reducer, initialState, applyMiddleware(thunk));
}

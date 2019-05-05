import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';

const initialState = {};

export function articleReducer(state = initialState, action) {
  switch (action.type) {
    case 'ARTICLE_SUCCESS':
      return {...state, [action.payload.id]: action.payload.data};
    case 'ARTICLE_ERROR':
      return {...state, [action.payload.id]: action.payload.error};
    default:
      return state;
  }
}

export function fetchArticle(id) {
  return dispatch => {
    return fetch(`http://localhost:${process.env.PORT}/api/articles/${id}`)
      .then(res => res.json())
      .then(data => {
        dispatch({type: 'ARTICLE_SUCCESS', payload: {id, data}});
      })
      .catch(error => {
        dispatch({type: 'ARTICLE_ERROR', payload: {id, error}});
      });
  };
}

export default function Article({id}) {
  const dispatch = useDispatch();
  const articleSelector = useCallback(state => state.articles[id], [id]);
  const article = useSelector(articleSelector);
  const shouldFetch = !article;

  if (shouldFetch) {
    throw dispatch(fetchArticle(id));
  }

  if (!article || !article.title || !article.body) {
    return (
      <section className="App-container">
        <Link to="/">&lt; Back</Link>
        <p>Something went wrong</p>
      </section>
    );
  }

  return (
    <section className="App-container">
      <Link to="/">&lt; Back</Link>
      <h1>{article.title}</h1>
      <p>{article.body}</p>
    </section>
  );
}

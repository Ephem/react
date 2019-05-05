import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';

const initialState = {
  articles: [],
};

export function articleListReducer(state = initialState, action) {
  switch (action.type) {
    case 'ARTICLE_LIST_SUCCESS':
      return {...state, articles: action.payload};
    default:
      return state;
  }
}

export function fetchArticles() {
  return dispatch => {
    return fetch(`http://localhost:${process.env.PORT}/api/articles`)
      .then(res => res.json())
      .then(data => {
        dispatch({type: 'ARTICLE_LIST_SUCCESS', payload: data});
      });
  };
}

const articlesSelector = state => state.articleList.articles;

export default function Home() {
  const dispatch = useDispatch();
  const articles = useSelector(articlesSelector);

  const shouldFetch = articles.length === 0;

  if (shouldFetch) {
    throw dispatch(fetchArticles());
  }

  return (
    <section className="App-container">
      <h1>Articles</h1>
      <ul>
        {articles.map((article, i) => (
          <li key={i}>
            <Link to={`/${article.id}`}>{article.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

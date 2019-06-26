import React from 'react';
import gql from 'graphql-tag';
import {useQuery} from 'react-apollo-hooks';
import {Link} from 'react-router-dom';

const getFilms = gql`
  query GetFilms {
    allFilms(orderBy: episodeId_ASC) {
      episodeId
      title
    }
  }
`;

export default function Home() {
  const {data, error} = useQuery(getFilms, {suspend: true});

  if (error) {
    return (
      <section className="App-container">
        <Link to="/">&lt; Back</Link>
        <p>Something went wrong</p>
      </section>
    );
  }

  return (
    <section className="App-container">
      <h1>Star Wars Movies</h1>
      <ul>
        {data.allFilms.map(({episodeId, title}) => (
          <li key={episodeId}>
            <Link to={`/${title.replace(/ /g, '-')}`}>{title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

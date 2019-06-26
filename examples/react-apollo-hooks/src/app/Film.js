import React from 'react';
import gql from 'graphql-tag';
import {useQuery} from 'react-apollo-hooks';
import {Link} from 'react-router-dom';

const getFilm = gql`
  query GetFilm($title: String!) {
    Film(title: $title) {
      episodeId
      releaseDate
      director
      producers
      openingCrawl
    }
  }
`;

export default function Film({title}) {
  const {data, error} = useQuery(getFilm, {
    variables: {title},
    suspend: true,
  });

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
      <Link to="/">&lt; Back</Link>
      <h1>{title}</h1>
      <div className="Film-item">
        <strong>Episode id:</strong> {data.Film.episodeId}
      </div>
      <div className="Film-item">
        <strong>Release date:</strong>{' '}
        {new Date(data.Film.releaseDate).toDateString()}
      </div>
      <div className="Film-item">
        <strong>Director:</strong> {data.Film.director}
      </div>
      <div className="Film-item">
        <strong>Producers:</strong> {data.Film.producers.join(', ')}
      </div>
      <div className="Film-item">
        <strong>Opening crawl:</strong> {data.Film.openingCrawl}
      </div>
    </section>
  );
}

import React from 'react';
import {useQuery} from 'urql';
import {Link} from 'react-router-dom';

const getFilm = `
query GetFilm($title: String!) {
  Film (title: $title) {
    episodeId
    releaseDate
    director
    producers
    openingCrawl
  }
}
`;

export default function Film({title}) {
  const [res] = useQuery({
    query: getFilm,
    variables: {title},
  });

  if (res.fetching) {
    return <section className="App-container">Loading...</section>;
  } else if (res.error) {
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
        <strong>Episode id:</strong> {res.data.Film.episodeId}
      </div>
      <div className="Film-item">
        <strong>Release date:</strong>{' '}
        {new Date(res.data.Film.releaseDate).toDateString()}
      </div>
      <div className="Film-item">
        <strong>Director:</strong> {res.data.Film.director}
      </div>
      <div className="Film-item">
        <strong>Producers:</strong> {res.data.Film.producers.join(', ')}
      </div>
      <div className="Film-item">
        <strong>Opening crawl:</strong> {res.data.Film.openingCrawl}
      </div>
    </section>
  );
}

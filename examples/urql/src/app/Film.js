import React from 'react';
import {useQuery} from 'urql';
import {Link} from 'react-router-dom';

const getFilm = `
query GetFilm($title: String!) {
  Film (title: $title) {
    director
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
      <strong>Director:</strong> {res.data.Film.director}
    </section>
  );
}

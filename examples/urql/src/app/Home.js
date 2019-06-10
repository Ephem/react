import React from 'react';
import {useQuery} from 'urql';
import {Link} from 'react-router-dom';

const getFilms = `
  query GetFilms {
    allFilms {
      id
      title
    }
  }
`;

export default function Home() {
  const [res] = useQuery({
    query: getFilms,
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
      <h1>Star Wars Movies</h1>
      <ul>
        {res.data.allFilms.map(({id, title}) => (
          <li key={id}>
            <Link to={`/${title.replace(/ /g, '-')}`}>{title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

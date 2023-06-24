import { flex } from 'styled-system/patterns';
import Item from './Item';
import Navigation from './Navigation';
import { pages } from './pages';

export default function NavBar() {
  return (
    <Navigation
      menu={
        <div
          className={flex({
            direction: 'column',
            justifyContent: 'center',
            fontSize: 'xl',
          })}
        >
          {pages.map(page => (
            <Item key={page.path} page={page} />
          ))}
        </div>
      }
    />
  );
}

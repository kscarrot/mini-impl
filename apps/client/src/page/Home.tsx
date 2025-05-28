import type { FC } from 'react';
import { Link, Outlet } from 'react-router';

const Home: FC = () => {
  return (
    <>
      <h1>react router demo v6</h1>
      <nav>
        <Link to="/" style={{ marginRight: '15px' }}>
          首页
        </Link>
        <Link to="/list" style={{ marginRight: '15px' }}>
          列表
        </Link>
      </nav>
      <Outlet />
    </>
  );
};

export default Home;

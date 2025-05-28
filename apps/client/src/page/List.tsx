import type { FC } from 'react';

const List: FC = () => {
  return ['a', 'b', 'c'].map(item => <div key={item}>{item}</div>);
};

export default List;

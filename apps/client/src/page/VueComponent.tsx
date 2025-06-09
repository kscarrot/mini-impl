import { useEffect, useRef } from 'react';
import { installWebComponent } from '@mini-impl/vue2wrapper'; // 确保路径正确

// 注册 Web Component
installWebComponent();

const VueComponent: React.FC = () => {
  const vueLoginRef = useRef<any>(null);

  useEffect(() => {
    const el = vueLoginRef.current;
    if (el) {
      const handler = (e: any) => {
        console.log('Login data:', e.detail);
      };
      el.addEventListener('Vue2LoginSubmit', handler);
      return () => el.removeEventListener('Vue2LoginSubmit', handler);
    }
  }, []);

  return (
    <div>
      <h2>Vue Web Component in React</h2>
      {/* @ts-ignore */}
      <vue-login ref={vueLoginRef} initial-values={JSON.stringify({ username: '', password: '' })} />
    </div>
  );
};

export default VueComponent;

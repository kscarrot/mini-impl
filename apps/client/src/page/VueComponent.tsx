import { installWebComponent } from '@mini-impl/vue2wrapper' // 确保路径正确
import { useEffect, useRef } from 'react'

// 注册 Web Component
installWebComponent()

const VueComponent: React.FC = () => {
  const vueLoginRef = useRef<any>(null)

  useEffect(() => {
    const el = vueLoginRef.current
    if (el) {
      const handler = (e: any) => {
        console.warn('Login data:', e.detail)
      }
      el.addEventListener('Vue2LoginSubmit', handler)
      return () => el.removeEventListener('Vue2LoginSubmit', handler)
    }
  }, [])

  return (
    <div>
      <h2>Vue Web Component in React</h2>
      {/* @ts-expect-error custom element from vue wrapper */}
      <vue-login ref={vueLoginRef} initial-values={JSON.stringify({ username: '', password: '' })} />
    </div>
  )
}

export default VueComponent

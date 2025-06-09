declare module '@mini-impl/vue2wrapper' {
  export function installWebComponent(): void;
}

declare namespace JSX {
  interface IntrinsicElements {
    'vue-login': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'initial-values'?: string;
        ref?: React.RefObject<any>;
      },
      HTMLElement
    >;
  }
}

// 声明自定义事件类型
interface Vue2LoginSubmitEvent extends CustomEvent {
  detail: {
    username: string;
    password: string;
  };
}

declare global {
  interface HTMLElementEventMap {
    Vue2LoginSubmit: Vue2LoginSubmitEvent;
  }
}

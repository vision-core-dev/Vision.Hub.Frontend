import { Component } from "react";
import type { ReactNode } from "react";


interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: unknown, errorInfo: unknown) {
        console.error("❌ Помилка в компоненті:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div className="error-boundary">Щось пішло не так. Спробуй перезавантажити сторінку.</div>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;









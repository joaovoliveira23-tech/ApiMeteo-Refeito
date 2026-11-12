import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.css'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error) { console.error('Erro ao renderizar ApiMeteo:', error) }
  render() {
    if (this.state.hasError) return <main className="fatal"><h1>Ops! O ApiMeteo encontrou um erro.</h1><p>Recarregue a página. Se continuar, abra o Console do navegador (F12) e envie a mensagem vermelha.</p></main>
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>
)